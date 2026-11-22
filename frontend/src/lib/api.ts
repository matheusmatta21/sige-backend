import type {
  AverageScoresResponse,
  GameDetailsResponse,
  GamesResponse,
  GenreRegionSalesItem,
  GlobalSalesResponse,
  PublisherAnalyticsItem,
  ReportPreviewResponse,
  SalesByRegionResponse,
  SalesByYearItem,
  SalesRankingItem,
  TopGenreResponse,
  TopPlatformItem,
} from './types';

export const API_BASE = (import.meta.env.VITE_API_URL as string | undefined) ?? '/api';

export interface FilterQueryParams {
  publishers?: string[];
  genres?: string[];
  platforms?: string[];
  ratings?: string[];
  yearFrom?: number;
  yearTo?: number;
  criticMin?: number;
  criticMax?: number;
}

function buildDashboardParams(
  filters: FilterQueryParams = {},
  extra: Record<string, string | number | boolean | undefined> = {},
): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.publishers?.length) {
    params.set('publisher', filters.publishers.join(','));
  }
  if (filters.genres?.length) {
    params.set('genre', filters.genres.join(','));
  }
  if (filters.platforms?.length) {
    params.set('platform', filters.platforms.join(','));
  }
  if (filters.ratings?.length) {
    params.set('rating', filters.ratings.join(','));
  }
  if (filters.yearFrom !== undefined) {
    params.set('yearFrom', String(filters.yearFrom));
  }
  if (filters.yearTo !== undefined) {
    params.set('yearTo', String(filters.yearTo));
  }
  if (filters.criticMin !== undefined) {
    params.set('criticMin', String(filters.criticMin));
  }
  if (filters.criticMax !== undefined) {
    params.set('criticMax', String(filters.criticMax));
  }
  for (const [key, val] of Object.entries(extra)) {
    if (val !== undefined && val !== '') {
      params.set(key, String(val));
    }
  }
  return params;
}

function buildSingleValueParams(
  filters: FilterQueryParams = {},
  extra: Record<string, string | number | boolean | undefined> = {},
): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.publishers?.length) {
    params.set('publisher', filters.publishers[0]);
  }
  if (filters.genres?.length) {
    params.set('genre', filters.genres[0]);
  }
  if (filters.platforms?.length) {
    params.set('platform', filters.platforms[0]);
  }
  if (filters.ratings?.length) {
    params.set('rating', filters.ratings[0]);
  }
  if (filters.yearFrom !== undefined) {
    params.set('yearFrom', String(filters.yearFrom));
  }
  if (filters.yearTo !== undefined) {
    params.set('yearTo', String(filters.yearTo));
  }
  if (filters.criticMin !== undefined) {
    params.set('criticMin', String(filters.criticMin));
  }
  if (filters.criticMax !== undefined) {
    params.set('criticMax', String(filters.criticMax));
  }
  for (const [key, val] of Object.entries(extra)) {
    if (val !== undefined && val !== '') {
      params.set(key, String(val));
    }
  }
  return params;
}

async function fetchJson<T>(
  path: string,
  params?: URLSearchParams,
  signal?: AbortSignal,
): Promise<T> {
  const qs = params?.toString();
  const url = `${API_BASE}${path}${qs ? `?${qs}` : ''}`;
  const res = await fetch(url, { signal });
  if (!res.ok) {
    throw new Error(`Erro ${res.status} ao consultar ${path}`);
  }
  return res.json() as Promise<T>;
}

export async function downloadFile(
  path: string,
  params: URLSearchParams,
  fallbackFilename: string,
) {
  const qs = params.toString();
  const url = `${API_BASE}${path}${qs ? `?${qs}` : ''}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Falha ao exportar (${res.status})`);
  }
  const blob = await res.blob();
  const disp = res.headers.get('content-disposition');
  const match = disp?.match(/filename="?([^"]+)"?/i);
  const filename = match?.[1] ?? fallbackFilename;
  const href = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = href;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(href);
}

export const api = {
  getPublishersList: (signal?: AbortSignal) =>
    fetchJson<{ name: string }[]>('/publishers', undefined, signal),
  getGenresList: (signal?: AbortSignal) =>
    fetchJson<{ name: string }[]>('/genres', undefined, signal),
  getPlatformsList: (signal?: AbortSignal) =>
    fetchJson<{ name: string }[]>('/platforms', undefined, signal),
  getRatingsList: (signal?: AbortSignal) =>
    fetchJson<{ name: string }[]>('/ratings', undefined, signal),

  getGlobalSales: (filters: FilterQueryParams, signal?: AbortSignal) =>
    fetchJson<GlobalSalesResponse>(
      '/dashboard/overview/global-sales',
      buildDashboardParams(filters),
      signal,
    ),
  getTopGenre: (filters: FilterQueryParams, signal?: AbortSignal) =>
    fetchJson<TopGenreResponse>(
      '/dashboard/overview/top-genres',
      buildDashboardParams(filters),
      signal,
    ),
  getAverageScores: (filters: FilterQueryParams, signal?: AbortSignal) =>
    fetchJson<AverageScoresResponse>(
      '/dashboard/overview/average-score',
      buildDashboardParams(filters),
      signal,
    ),
  getSalesByRegion: (filters: FilterQueryParams, signal?: AbortSignal) =>
    fetchJson<SalesByRegionResponse>(
      '/dashboard/overview/sales-by-region',
      buildDashboardParams(filters),
      signal,
    ),
  getTop5Platforms: (filters: FilterQueryParams, signal?: AbortSignal) =>
    fetchJson<TopPlatformItem[]>(
      '/dashboard/overview/top-5-platforms',
      buildDashboardParams(filters),
      signal,
    ),
  getSalesByYear: (filters: FilterQueryParams, signal?: AbortSignal) =>
    fetchJson<SalesByYearItem[]>(
      '/dashboard/overview/sales-by-year',
      buildDashboardParams(filters),
      signal,
    ),

  getGenreSalesByRegion: (filters: FilterQueryParams, signal?: AbortSignal) =>
    fetchJson<GenreRegionSalesItem[]>(
      '/dashboard/sales-map/genre-sales-by-region',
      buildDashboardParams(filters),
      signal,
    ),

  getSalesRanking: (
    by: 'platform' | 'genre' | 'publisher',
    limit: number,
    filters: FilterQueryParams,
    signal?: AbortSignal,
  ) =>
    fetchJson<SalesRankingItem[]>(
      '/dashboard/rankings/sales',
      buildDashboardParams(filters, { by, limit }),
      signal,
    ),

  getPublishersAnalytics: (
    limit: number,
    filters: FilterQueryParams,
    signal?: AbortSignal,
  ) =>
    fetchJson<PublisherAnalyticsItem[]>(
      '/dashboard/rankings/publishers',
      buildDashboardParams(filters, { limit }),
      signal,
    ),

  getGameDetails: (id: number, signal?: AbortSignal) =>
    fetchJson<GameDetailsResponse>(
      `/dashboard/game-analytics/game-details/${id}`,
      undefined,
      signal,
    ),

  getGames: (
    filters: FilterQueryParams,
    opts: {
      search?: string;
      limit?: number;
      page?: number;
      sortBy?: string;
      order?: 'asc' | 'desc';
    } = {},
    signal?: AbortSignal,
  ) =>
    fetchJson<GamesResponse>(
      '/games',
      buildSingleValueParams(filters, opts),
      signal,
    ),

  getGameById: (id: number, signal?: AbortSignal) =>
    fetchJson<GamesResponse['data'][number]>(`/games/${id}`, undefined, signal),

  exportGamesCsv: (
    filters: FilterQueryParams,
    opts: { search?: string; sortBy?: string; order?: 'asc' | 'desc' } = {},
  ) =>
    downloadFile(
      '/games/export',
      buildSingleValueParams(filters, opts),
      'jogos-export.csv',
    ),

  getReportPreview: (
    filters: FilterQueryParams,
    opts: {
      title?: string;
      limit?: number;
      includeKpis?: boolean;
      includeRegions?: boolean;
      includePlatforms?: boolean;
      includeGenres?: boolean;
      includeGames?: boolean;
    },
    signal?: AbortSignal,
  ) =>
    fetchJson<ReportPreviewResponse>(
      '/dashboard/reports/preview',
      buildSingleValueParams(filters, opts),
      signal,
    ),

  exportReport: (
    format: 'csv' | 'pdf',
    filters: FilterQueryParams,
    opts: {
      title?: string;
      limit?: number;
      includeKpis?: boolean;
      includeRegions?: boolean;
      includePlatforms?: boolean;
      includeGenres?: boolean;
      includeGames?: boolean;
    },
  ) =>
    downloadFile(
      '/dashboard/reports/export',
      buildSingleValueParams(filters, { format, ...opts }),
      format === 'pdf' ? 'relatorio-vendas.pdf' : 'relatorio-vendas.csv',
    ),
};
