import { useEffect, useMemo, useState } from 'react';
import { Link } from '@tanstack/react-router';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  axisProps,
  fmtM,
  gridProps,
  horizontalGridProps,
  tooltipStyle,
} from '@/components/sige/charts';
import { EmptyState, KpiCard, PageTitle, Panel } from '@/components/sige/Panel';
import { ScoreRing } from '@/components/sige/Scores';
import { SpecBlock } from '@/components/sige/SpecBlock';
import { WorldMap } from '@/components/sige/WorldMap';
import { api } from '@/lib/api';
import { useFilters } from '@/lib/filters';
import {
  fmtUnits,
  normalizeScore,
  REGION_MAP,
  REGIONS,
} from '@/lib/metrics';
import type {
  AverageScoresResponse,
  RegionKey,
  SalesByRegionResponse,
  SalesByYearItem,
  TopGenreResponse,
  TopPlatformItem,
} from '@/lib/types';

export function OverviewPage() {
  const { queryParams, openDrill, totalTitles } = useFilters();
  const [globalSales, setGlobalSales] = useState(0);
  const [topGenre, setTopGenre] = useState<TopGenreResponse>({
    genre_name: '—',
    global_sales: 0,
  });
  const [avgScores, setAvgScores] = useState<AverageScoresResponse | null>(null);
  const [salesByRegion, setSalesByRegion] =
    useState<SalesByRegionResponse | null>(null);
  const [topPlatforms, setTopPlatforms] = useState<TopPlatformItem[]>([]);
  const [salesByYear, setSalesByYear] = useState<SalesByYearItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);

    Promise.all([
      api.getGlobalSales(queryParams, controller.signal),
      api.getTopGenre(queryParams, controller.signal),
      api.getAverageScores(queryParams, controller.signal),
      api.getSalesByRegion(queryParams, controller.signal),
      api.getTop5Platforms(queryParams, controller.signal),
      api.getSalesByYear(queryParams, controller.signal),
    ])
      .then(([gs, tg, avg, sbr, topP, sby]) => {
        setGlobalSales(gs.global_sales);
        setTopGenre(tg);
        setAvgScores(avg);
        setSalesByRegion(sbr);
        setTopPlatforms(topP);
        setSalesByYear(sby);
      })
      .catch(() => {
        // handled by global apiError banner
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [queryParams]);

  const regionSlices = useMemo(() => {
    if (!salesByRegion) return [];
    return [
      {
        key: 'na' as RegionKey,
        label: REGION_MAP.na.label,
        color: REGION_MAP.na.color,
        value: salesByRegion.na.na_sales,
        pct: salesByRegion.na.na_percentage,
      },
      {
        key: 'eu' as RegionKey,
        label: REGION_MAP.eu.label,
        color: REGION_MAP.eu.color,
        value: salesByRegion.eu.eu_sales,
        pct: salesByRegion.eu.eu_percentage,
      },
      {
        key: 'jp' as RegionKey,
        label: REGION_MAP.jp.label,
        color: REGION_MAP.jp.color,
        value: salesByRegion.jp.jp_sales,
        pct: salesByRegion.jp.jp_percentage,
      },
      {
        key: 'other' as RegionKey,
        label: REGION_MAP.other.label,
        color: REGION_MAP.other.color,
        value: salesByRegion.other.other_sales,
        pct: salesByRegion.other.other_percentage,
      },
    ];
  }, [salesByRegion]);

  const criticAvg = normalizeScore(avgScores?.criticAverageScore, 'critic');
  const userAvg = normalizeScore(avgScores?.userAverageScore, 'user');

  const isEmpty = !loading && totalTitles === 0;

  return (
    <div>
      <PageTitle title="Visão Geral" />

      {isEmpty ? (
        <EmptyState />
      ) : (
        <>
          <div className="grid grid-cols-6 gap-4">
            <KpiCard
              className="col-span-3"
              label="UNIDADES GLOBAIS"
              value={fmtUnits(globalSales)}
              sub="NA + EU + JP + Outros"
            />
            <KpiCard
              className="col-span-1"
              label="GÊNERO LÍDER"
              value={topGenre.genre_name || '—'}
              sub={fmtUnits(topGenre.global_sales)}
            />
            <div className="hud-panel col-span-2 flex items-center justify-around p-4">
              <ScoreRing score={criticAvg} label="MÉDIA CRÍTICA" size={104} />
              <ScoreRing score={userAvg} label="MÉDIA USUÁRIO" size={104} />
            </div>
          </div>

          <div className="mt-4 grid grid-cols-12 gap-4">
            <Panel
              className="col-span-8"
              title="Unidades vendidas por região"
            >
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={salesByYear}
                    onClick={(state) => {
                      const yr = state?.activeLabel;
                      if (yr) {
                        const yearNum = Number(yr);
                        openDrill({
                          title: `Lançamentos de ${yearNum}`,
                          extraFilter: { yearFrom: yearNum, yearTo: yearNum },
                        });
                      }
                    }}
                  >
                    <CartesianGrid {...gridProps} />
                    <XAxis dataKey="year_of_release" {...axisProps} />
                    <YAxis {...axisProps} tickFormatter={fmtM} />
                    <Tooltip
                      contentStyle={tooltipStyle}
                      formatter={(val: number, name: string) => [
                        fmtUnits(Number(val)),
                        name,
                      ]}
                    />
                    <Bar
                      dataKey="na_sales"
                      name="América do Norte"
                      stackId="a"
                      fill="var(--region-na)"
                      isAnimationActive={false}
                      cursor="pointer"
                    />
                    <Bar
                      dataKey="eu_sales"
                      name="Europa"
                      stackId="a"
                      fill="var(--region-eu)"
                      isAnimationActive={false}
                      cursor="pointer"
                    />
                    <Bar
                      dataKey="jp_sales"
                      name="Japão"
                      stackId="a"
                      fill="var(--region-jp)"
                      isAnimationActive={false}
                      cursor="pointer"
                    />
                    <Bar
                      dataKey="other_sales"
                      name="Outros"
                      stackId="a"
                      fill="var(--region-other)"
                      radius={[3, 3, 0, 0]}
                      isAnimationActive={false}
                      cursor="pointer"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-5 text-xs text-muted-foreground">
                {REGIONS.map((r) => (
                  <div key={r.key} className="flex items-center gap-1.5">
                    <span
                      className="h-2.5 w-2.5 rounded-[2px]"
                      style={{ backgroundColor: r.color }}
                    />
                    <span>{r.label}</span>
                  </div>
                ))}
              </div>
            </Panel>

            <Panel className="col-span-4" title="Unidades por região">
              <div className="flex flex-col items-center">
                <div className="relative flex h-[224px] w-[224px] items-center justify-center">
                  <PieChart width={224} height={224}>
                    <Pie
                      data={regionSlices}
                      dataKey="value"
                      nameKey="label"
                      cx="50%"
                      cy="50%"
                      innerRadius={62}
                      outerRadius={92}
                      paddingAngle={2}
                      startAngle={90}
                      endAngle={-270}
                      isAnimationActive={false}
                      onClick={(_, idx) => {
                        const slice = regionSlices[idx];
                        if (slice) {
                          openDrill({
                            title: `Vendas — ${slice.label}`,
                            region: slice.key,
                          });
                        }
                      }}
                    >
                      {regionSlices.map((s) => (
                        <Cell
                          key={s.key}
                          fill={s.color}
                          className="cursor-pointer outline-none"
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={tooltipStyle}
                      formatter={(val: number) => fmtUnits(Number(val))}
                    />
                  </PieChart>
                  <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                    <span className="font-display text-2xl font-bold text-foreground tabular">
                      {Math.round(globalSales)}M
                    </span>
                    <span className="hud-label">UNIDADES</span>
                  </div>
                </div>

                <div className="mt-2 w-full space-y-2">
                  {regionSlices.map((s) => (
                    <button
                      key={s.key}
                      type="button"
                      onClick={() =>
                        openDrill({
                          title: `Vendas — ${s.label}`,
                          region: s.key,
                        })
                      }
                      className="flex w-full items-center justify-between rounded-lg px-2 py-1 text-xs transition-colors hover:bg-accent/60"
                    >
                      <span className="flex items-center gap-2 text-foreground">
                        <span
                          className="h-2.5 w-2.5 rounded-[2px]"
                          style={{ backgroundColor: s.color }}
                        />
                        {s.label}
                      </span>
                      <span className="text-muted-foreground tabular">
                        {s.pct.toFixed(1)}%
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </Panel>
          </div>

          <div className="mt-4 grid grid-cols-12 gap-4">
            <Panel
              className="col-span-5"
              title="Plataformas por unidades"
            >
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={topPlatforms}
                    layout="vertical"
                    margin={{ left: 4, right: 16 }}
                    onClick={(state) => {
                      const plat = state?.activeLabel;
                      if (plat) {
                        openDrill({
                          title: `Plataforma — ${plat}`,
                          extraFilter: { platform: String(plat) },
                        });
                      }
                    }}
                  >
                    <CartesianGrid {...horizontalGridProps} />
                    <XAxis type="number" {...axisProps} tickFormatter={fmtM} />
                    <YAxis
                      type="category"
                      dataKey="platform_name"
                      width={56}
                      {...axisProps}
                    />
                    <Tooltip
                      contentStyle={tooltipStyle}
                      formatter={(val: number) => [
                        fmtUnits(Number(val)),
                        'Vendas Globais',
                      ]}
                    />
                    <Bar
                      dataKey="global_sales"
                      fill="var(--primary)"
                      radius={[0, 4, 4, 0]}
                      isAnimationActive={false}
                      cursor="pointer"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Panel>

            <Panel
              className="col-span-7"
              title="Vendas no globo"
              action={
                <Link
                  to="/mapa"
                  className="hud-label text-primary transition-colors hover:underline"
                >
                  ABRIR MAPA →
                </Link>
              }
            >
              <WorldMap
                salesByRegion={salesByRegion}
                height={260}
                onSelect={(region) =>
                  openDrill({
                    title: `Vendas — ${REGION_MAP[region].label}`,
                    region,
                  })
                }
              />
            </Panel>
          </div>
        </>
      )}

      <SpecBlock
        spec={{
          id: 'TELA-01',
          title: 'VISÃO GERAL (DASHBOARD EXECUTIVO)',
          objective:
            'Consolidar KPIs executivos de vendas globais, gênero líder, médias de crítica/usuário, evolução anual por região, participação de plataformas e distribuição geográfica.',
          dataPoints: [
            'Unidades globais e gênero líder filtrados em tempo real.',
            'Média crítica (escala 0–100 normalizada para 0–10) e média de usuários.',
            'Série histórica empilhada por ano de lançamento e Top 5 plataformas.',
          ],
          interactions: [
            'Clique nas barras anuais, plataformas, fatias da rosca ou regiões do mapa abre o DrillDrawer com os títulos correspondentes.',
          ],
        }}
      />
    </div>
  );
}
