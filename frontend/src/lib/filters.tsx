import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { api, type FilterQueryParams } from './api';
import type { RegionKey } from './types';

export interface FilterState {
  publishers: string[];
  genres: string[];
  platforms: string[];
  ratings: string[];
  yearRange: [number, number] | null;
  criticRange: [number, number];
}

export interface DrillExtraFilter {
  yearFrom?: number;
  yearTo?: number;
  platform?: string;
  genre?: string;
  publisher?: string;
}

export interface DrillState {
  title: string;
  region?: RegionKey;
  extraFilter?: DrillExtraFilter;
}

export interface FilterOptions {
  publishers: string[];
  genres: string[];
  platforms: string[];
  ratings: string[];
  yearBounds: [number, number];
}

interface FiltersContextValue {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  toggle: (
    key: 'publishers' | 'genres' | 'platforms' | 'ratings',
    value: string,
  ) => void;
  clear: () => void;
  active: number;
  options: FilterOptions;
  effectiveYearRange: [number, number];
  queryParams: FilterQueryParams;
  totalTitles: number | null;
  apiError: string | null;
  drill: DrillState | null;
  openDrill: (state: DrillState) => void;
  closeDrill: () => void;
}

const STORAGE_KEY = 'sige-filters';

const DEFAULT_FILTERS: FilterState = {
  publishers: [],
  genres: [],
  platforms: [],
  ratings: [],
  yearRange: null,
  criticRange: [0, 10],
};

function loadSavedFilters(): FilterState {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_FILTERS;
    const parsed = JSON.parse(raw) as Partial<FilterState>;
    return {
      publishers: Array.isArray(parsed.publishers) ? parsed.publishers : [],
      genres: Array.isArray(parsed.genres) ? parsed.genres : [],
      platforms: Array.isArray(parsed.platforms) ? parsed.platforms : [],
      ratings: Array.isArray(parsed.ratings) ? parsed.ratings : [],
      yearRange:
        Array.isArray(parsed.yearRange) && parsed.yearRange.length === 2
          ? [Number(parsed.yearRange[0]), Number(parsed.yearRange[1])]
          : null,
      criticRange:
        Array.isArray(parsed.criticRange) && parsed.criticRange.length === 2
          ? [Number(parsed.criticRange[0]), Number(parsed.criticRange[1])]
          : [0, 10],
    };
  } catch {
    return DEFAULT_FILTERS;
  }
}

const FiltersContext = createContext<FiltersContextValue | null>(null);

export function FiltersProvider({ children }: { children: ReactNode }) {
  const [filters, setFilters] = useState<FilterState>(loadSavedFilters);
  const [options, setOptions] = useState<FilterOptions>({
    publishers: [],
    genres: [],
    platforms: [],
    ratings: [],
    yearBounds: [1980, 2020],
  });
  const [totalTitles, setTotalTitles] = useState<number | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [drill, setDrill] = useState<DrillState | null>(null);

  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(filters));
    } catch {
      // ignore storage errors
    }
  }, [filters]);

  useEffect(() => {
    const controller = new AbortController();
    Promise.all([
      api.getPublishersList(controller.signal),
      api.getGenresList(controller.signal),
      api.getPlatformsList(controller.signal),
      api.getRatingsList(controller.signal),
      api.getSalesByYear({}, controller.signal),
    ])
      .then(([pubs, gens, plats, rats, years]) => {
        const yearValues = years
          .map((y) => y.year_of_release)
          .filter((y) => typeof y === 'number' && !Number.isNaN(y));
        const minY = yearValues.length ? Math.min(...yearValues) : 1980;
        const maxY = yearValues.length ? Math.max(...yearValues) : 2020;

        setOptions({
          publishers: pubs.map((p) => p.name).sort((a, b) => a.localeCompare(b)),
          genres: gens.map((g) => g.name).sort((a, b) => a.localeCompare(b)),
          platforms: plats.map((p) => p.name).sort((a, b) => a.localeCompare(b)),
          ratings: rats.map((r) => r.name).sort((a, b) => a.localeCompare(b)),
          yearBounds: [minY, maxY],
        });
        setApiError(null);
      })
      .catch((err) => {
        if (controller.signal.aborted) return;
        setApiError(
          err instanceof Error
            ? err.message
            : 'Não foi possível conectar à API.',
        );
      });

    return () => controller.abort();
  }, []);

  const effectiveYearRange = useMemo<[number, number]>(() => {
    if (!filters.yearRange) return options.yearBounds;
    return [
      Math.max(options.yearBounds[0], filters.yearRange[0]),
      Math.min(options.yearBounds[1], filters.yearRange[1]),
    ];
  }, [filters.yearRange, options.yearBounds]);

  const isYearFiltered = useMemo(() => {
    if (!filters.yearRange) return false;
    return (
      filters.yearRange[0] > options.yearBounds[0] ||
      filters.yearRange[1] < options.yearBounds[1]
    );
  }, [filters.yearRange, options.yearBounds]);

  const isCriticFiltered =
    filters.criticRange[0] > 0 || filters.criticRange[1] < 10;

  const queryParams = useMemo<FilterQueryParams>(() => {
    return {
      publishers: filters.publishers,
      genres: filters.genres,
      platforms: filters.platforms,
      ratings: filters.ratings,
      ...(isYearFiltered
        ? {
            yearFrom: effectiveYearRange[0],
            yearTo: effectiveYearRange[1],
          }
        : {}),
      ...(isCriticFiltered
        ? {
            criticMin: Math.round(filters.criticRange[0] * 10),
            criticMax: Math.round(filters.criticRange[1] * 10),
          }
        : {}),
    };
  }, [
    filters.publishers,
    filters.genres,
    filters.platforms,
    filters.ratings,
    filters.criticRange,
    isYearFiltered,
    isCriticFiltered,
    effectiveYearRange,
  ]);

  useEffect(() => {
    const controller = new AbortController();
    api
      .getGames(queryParams, { limit: 1, page: 1 }, controller.signal)
      .then((res) => {
        setTotalTitles(res.total);
        setApiError(null);
      })
      .catch((err) => {
        if (controller.signal.aborted) return;
        setApiError(
          err instanceof Error
            ? err.message
            : 'Não foi possível conectar à API.',
        );
      });

    return () => controller.abort();
  }, [queryParams]);

  const toggle = useCallback(
    (key: 'publishers' | 'genres' | 'platforms' | 'ratings', value: string) => {
      setFilters((prev) => {
        const current = prev[key];
        const next = current.includes(value)
          ? current.filter((v) => v !== value)
          : [...current, value];
        return { ...prev, [key]: next };
      });
    },
    [],
  );

  const clear = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  const active = useMemo(() => {
    return (
      filters.publishers.length +
      filters.genres.length +
      filters.platforms.length +
      filters.ratings.length +
      (isYearFiltered ? 1 : 0) +
      (isCriticFiltered ? 1 : 0)
    );
  }, [
    filters.publishers.length,
    filters.genres.length,
    filters.platforms.length,
    filters.ratings.length,
    isYearFiltered,
    isCriticFiltered,
  ]);

  const openDrill = useCallback((state: DrillState) => {
    setDrill(state);
  }, []);

  const closeDrill = useCallback(() => {
    setDrill(null);
  }, []);

  const value = useMemo<FiltersContextValue>(
    () => ({
      filters,
      setFilters,
      toggle,
      clear,
      active,
      options,
      effectiveYearRange,
      queryParams,
      totalTitles,
      apiError,
      drill,
      openDrill,
      closeDrill,
    }),
    [
      filters,
      toggle,
      clear,
      active,
      options,
      effectiveYearRange,
      queryParams,
      totalTitles,
      apiError,
      drill,
      openDrill,
      closeDrill,
    ],
  );

  return (
    <FiltersContext.Provider value={value}>{children}</FiltersContext.Provider>
  );
}

export function useFilters() {
  const ctx = useContext(FiltersContext);
  if (!ctx) {
    throw new Error('useFilters deve ser usado dentro de FiltersProvider');
  }
  return ctx;
}
