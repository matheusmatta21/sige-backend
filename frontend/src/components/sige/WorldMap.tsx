import { useMemo, useState } from 'react';
import { geoCentroid, geoNaturalEarth1, geoPath } from 'd3-geo';
import { feature } from 'topojson-client';
import type { Topology, GeometryCollection } from 'topojson-specification';
import worldData from 'world-atlas/countries-110m.json';
import { fmtUnits, REGION_MAP, REGIONS } from '@/lib/metrics';
import type { RegionKey, SalesByRegionResponse } from '@/lib/types';

const NA_COUNTRY_IDS = new Set(['840', '124', '484', '304']);

function classifyCountry(
  id: string,
  centroid: [number, number],
): RegionKey {
  if (NA_COUNTRY_IDS.has(id)) return 'na';
  if (id === '392') return 'jp';
  const [lon, lat] = centroid;
  if (id !== '643' && lon > -25 && lon < 45 && lat > 34) {
    return 'eu';
  }
  return 'other';
}

export function WorldMap({
  salesByRegion,
  height = 260,
  onSelect,
}: {
  salesByRegion: SalesByRegionResponse | null;
  height?: number;
  onSelect: (region: RegionKey) => void;
}) {
  const [hovered, setHovered] = useState<RegionKey | null>(null);

  const width = 800;
  const viewHeight = 400;

  const countries = useMemo(() => {
    const topo = worldData as unknown as Topology<{
      countries: GeometryCollection;
    }>;
    const fc = feature(topo, topo.objects.countries);
    const projection = geoNaturalEarth1().fitExtent(
      [
        [10, 10],
        [width - 10, viewHeight - 10],
      ],
      fc,
    );
    const pathGen = geoPath(projection);

    return fc.features
      .filter((f) => String(f.id) !== '010')
      .map((f, idx) => {
        const id = String(f.id ?? idx);
        const centroid = geoCentroid(f);
        const region = classifyCountry(id, centroid);
        const d = pathGen(f) ?? '';
        return { id, region, d };
      })
      .filter((c) => c.d.length > 0);
  }, []);

  const regionValues = useMemo(() => {
    if (!salesByRegion) {
      return {
        na: { sales: 0, pct: 0 },
        eu: { sales: 0, pct: 0 },
        jp: { sales: 0, pct: 0 },
        other: { sales: 0, pct: 0 },
      };
    }
    return {
      na: {
        sales: salesByRegion.na.na_sales,
        pct: salesByRegion.na.na_percentage,
      },
      eu: {
        sales: salesByRegion.eu.eu_sales,
        pct: salesByRegion.eu.eu_percentage,
      },
      jp: {
        sales: salesByRegion.jp.jp_sales,
        pct: salesByRegion.jp.jp_percentage,
      },
      other: {
        sales: salesByRegion.other.other_sales,
        pct: salesByRegion.other.other_percentage,
      },
    };
  }, [salesByRegion]);

  const hoveredMeta = hovered ? REGION_MAP[hovered] : null;
  const hoveredStats = hovered ? regionValues[hovered] : null;

  return (
    <div className="relative w-full select-none" style={{ height }}>
      <svg
        viewBox={`0 0 ${width} ${viewHeight}`}
        className="h-full w-full"
        role="img"
        aria-label="Mapa de vendas por região"
      >
        {countries.map((c) => {
          const meta = REGION_MAP[c.region];
          const isHovered = hovered === c.region;
          const opacity = hovered
            ? isHovered
              ? 0.95
              : 0.16
            : c.region === 'other'
              ? 0.45
              : 0.78;

          return (
            <path
              key={c.id}
              d={c.d}
              fill={meta.color}
              fillOpacity={opacity}
              stroke="var(--background)"
              strokeWidth={0.6}
              className="cursor-pointer transition-opacity duration-150"
              onMouseEnter={() => setHovered(c.region)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => onSelect(c.region)}
            />
          );
        })}
      </svg>

      {hoveredMeta && hoveredStats && (
        <div className="hud-panel pointer-events-none absolute left-2 top-2 px-3.5 py-2.5 shadow-md">
          <div className="flex items-center gap-2">
            <span
              className="h-2.5 w-2.5 rounded-xs"
              style={{ backgroundColor: hoveredMeta.color }}
            />
            <span className="font-display text-xs font-semibold text-foreground">
              {hoveredMeta.label}
            </span>
          </div>
          <div className="mt-1 font-display text-sm font-bold text-foreground tabular">
            {fmtUnits(hoveredStats.sales)}
          </div>
          <div className="text-[11px] text-muted-foreground tabular">
            {hoveredStats.pct.toFixed(1)}% do total · clique para detalhar
          </div>
        </div>
      )}

      {!hovered && (
        <div className="sr-only">
          {REGIONS.map((r) => r.label).join(', ')}
        </div>
      )}
    </div>
  );
}
