import { useEffect, useMemo, useState } from 'react';
import { EmptyState, PageTitle, Panel } from '@/components/sige/Panel';
import { SpecBlock } from '@/components/sige/SpecBlock';
import { WorldMap } from '@/components/sige/WorldMap';
import { api } from '@/lib/api';
import { useFilters } from '@/lib/filters';
import { fmtNumber, fmtUnits, REGION_MAP, REGIONS } from '@/lib/metrics';
import type {
  GenreRegionSalesItem,
  RegionKey,
  SalesByRegionResponse,
} from '@/lib/types';

export function MapaPage() {
  const { queryParams, openDrill, totalTitles } = useFilters();
  const [globalSales, setGlobalSales] = useState(0);
  const [salesByRegion, setSalesByRegion] =
    useState<SalesByRegionResponse | null>(null);
  const [genreMatrix, setGenreMatrix] = useState<GenreRegionSalesItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);

    Promise.all([
      api.getGlobalSales(queryParams, controller.signal),
      api.getSalesByRegion(queryParams, controller.signal),
      api.getGenreSalesByRegion(queryParams, controller.signal),
    ])
      .then(([gs, sbr, gm]) => {
        setGlobalSales(gs.global_sales);
        setSalesByRegion(sbr);
        setGenreMatrix(gm);
      })
      .catch(() => {})
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [queryParams]);

  const rankedRegions = useMemo(() => {
    if (!salesByRegion) return [];
    const list: {
      key: RegionKey;
      label: string;
      color: string;
      sales: number;
      pct: number;
    }[] = [
      {
        key: 'na',
        label: REGION_MAP.na.label,
        color: REGION_MAP.na.color,
        sales: salesByRegion.na.na_sales,
        pct: salesByRegion.na.na_percentage,
      },
      {
        key: 'eu',
        label: REGION_MAP.eu.label,
        color: REGION_MAP.eu.color,
        sales: salesByRegion.eu.eu_sales,
        pct: salesByRegion.eu.eu_percentage,
      },
      {
        key: 'jp',
        label: REGION_MAP.jp.label,
        color: REGION_MAP.jp.color,
        sales: salesByRegion.jp.jp_sales,
        pct: salesByRegion.jp.jp_percentage,
      },
      {
        key: 'other',
        label: REGION_MAP.other.label,
        color: REGION_MAP.other.color,
        sales: salesByRegion.other.other_sales,
        pct: salesByRegion.other.other_percentage,
      },
    ];
    return list.sort((a, b) => b.sales - a.sales);
  }, [salesByRegion]);

  const cellMax = useMemo(() => {
    let max = 1;
    for (const row of genreMatrix) {
      max = Math.max(
        max,
        row.sales.na_sales,
        row.sales.eu_sales,
        row.sales.jp_sales,
        row.sales.other_sales,
      );
    }
    return max;
  }, [genreMatrix]);

  const isEmpty = !loading && totalTitles === 0;

  return (
    <div>
      <PageTitle title="Mapa de Vendas Global" />

      {isEmpty ? (
        <EmptyState />
      ) : (
        <>
          <div className="grid grid-cols-12 gap-4">
            <Panel
              className="col-span-8"
              title="Unidades vendidas no mundo"
            >
              <WorldMap
                salesByRegion={salesByRegion}
                height={420}
                onSelect={(region) =>
                  openDrill({
                    title: `Vendas — ${REGION_MAP[region].label}`,
                    region,
                  })
                }
              />
            </Panel>

            <Panel
              className="col-span-4 flex flex-col justify-between"
              title="Regiões"
            >
              <div className="space-y-4">
                {rankedRegions.map((reg, idx) => (
                  <button
                    key={reg.key}
                    type="button"
                    onClick={() =>
                      openDrill({
                        title: `Vendas — ${reg.label}`,
                        region: reg.key,
                      })
                    }
                    className="block w-full rounded-xl p-1.5 text-left transition-colors hover:bg-accent/50"
                  >
                    <div className="flex items-baseline justify-between text-sm">
                      <span className="flex items-center gap-2 font-medium text-foreground">
                        <span className="text-xs text-muted-foreground tabular">
                          #{idx + 1}
                        </span>
                        {reg.label}
                      </span>
                      <span className="font-display font-bold text-foreground tabular">
                        {fmtUnits(reg.sales)}
                      </span>
                    </div>
                    <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${Math.min(100, reg.pct)}%`,
                          backgroundColor: reg.color,
                        }}
                      />
                    </div>
                    <div className="mt-1 text-[11px] text-muted-foreground tabular">
                      {reg.pct.toFixed(1)}% do total global
                    </div>
                  </button>
                ))}
              </div>

              <div className="mt-6 border-t pt-4">
                <div className="hud-label">TOTAL GLOBAL</div>
                <div className="mt-1 font-display text-2xl font-bold text-primary tabular">
                  {fmtUnits(globalSales)}
                </div>
              </div>
            </Panel>
          </div>

          <div className="mt-4 grid grid-cols-12 gap-4">
            <Panel
              className="col-span-12"
              title="Gêneros por região (unidades)"
            >
              <div className="overflow-x-auto">
                <table className="w-full border-separate border-spacing-y-1.5 text-xs">
                  <thead>
                    <tr>
                      <th className="pb-2 text-left font-display text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                        GÊNERO
                      </th>
                      {REGIONS.map((r) => (
                        <th
                          key={r.key}
                          className="pb-2 text-center font-display text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground"
                        >
                          {r.label.toUpperCase()}
                        </th>
                      ))}
                      <th className="pb-2 text-right font-display text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                        GLOBAL
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {genreMatrix.map((row) => (
                      <tr key={row.genre_name} className="group">
                        <td className="border-b border-border/50 py-2 pr-4 font-medium text-foreground">
                          {row.genre_name}
                        </td>
                        {REGIONS.map((r) => {
                          const val = row.sales[r.salesField];
                          const ratio = Math.max(0, Math.min(1, val / cellMax));
                          const intensity = Math.round((0.1 + 0.85 * ratio) * 100);
                          return (
                            <td key={r.key} className="px-1 py-0.5">
                              <button
                                type="button"
                                onClick={() =>
                                  openDrill({
                                    title: `${row.genre_name} — ${r.label}`,
                                    region: r.key,
                                    extraFilter: { genre: row.genre_name },
                                  })
                                }
                                style={{
                                  backgroundColor: `color-mix(in oklab, ${r.color} ${intensity}%, transparent)`,
                                }}
                                className="w-full rounded-sm py-2 text-center font-medium text-foreground tabular transition-transform hover:scale-[1.01] hover:ring-1 hover:ring-foreground/30"
                              >
                                {fmtNumber(val)}
                              </button>
                            </td>
                          );
                        })}
                        <td className="border-b border-border/50 py-2 pl-4 text-right font-display font-bold text-foreground tabular">
                          {fmtNumber(row.sales.global_sales)} M
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Panel>
          </div>
        </>
      )}

      <SpecBlock
        spec={{
          id: 'TELA-02',
          title: 'MAPA DE VENDAS GLOBAL',
          objective:
            'Comparar o desempenho geográfico das quatro macrorregiões (NA, EU, JP, Outros) e cruzar o volume de vendas por gênero em cada mercado.',
          dataPoints: [
            'Mapa coroplético interativo agrupado por macrorregião.',
            'Ranking regional com participação percentual sobre o total global.',
            'Matriz de calor Gênero × Região em milhões de unidades.',
          ],
          interactions: [
            'Hover no mapa destaca a região e exibe tooltip resumido.',
            'Clique em países, barras regionais ou células do heatmap abre o DrillDrawer filtrado.',
          ],
        }}
      />
    </div>
  );
}
