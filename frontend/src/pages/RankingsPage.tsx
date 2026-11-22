import { useEffect, useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  axisProps,
  fmtM,
  horizontalGridProps,
  tooltipStyle,
} from '@/components/sige/charts';
import { EmptyState, PageTitle, Panel } from '@/components/sige/Panel';
import { ScorePill } from '@/components/sige/Scores';
import { SpecBlock } from '@/components/sige/SpecBlock';
import { api } from '@/lib/api';
import { useFilters } from '@/lib/filters';
import { fmtUnits, normalizeScore, REGIONS } from '@/lib/metrics';
import type {
  GenreRegionSalesItem,
  PublisherAnalyticsItem,
  SalesRankingItem,
} from '@/lib/types';

type GroupBy = 'platform' | 'genre' | 'publisher';

const GROUP_LABELS: Record<GroupBy, string> = {
  platform: 'Plataforma',
  genre: 'Gênero',
  publisher: 'Publicadora',
};

const RADAR_COLORS = [
  'var(--primary)',
  'var(--region-na)',
  'var(--region-jp)',
  'var(--region-other)',
];

export function RankingsPage() {
  const { queryParams, openDrill, totalTitles } = useFilters();
  const [top, setTop] = useState<5 | 10>(10);
  const [by, setBy] = useState<GroupBy>('platform');
  const [rankingData, setRankingData] = useState<SalesRankingItem[]>([]);
  const [genreRegions, setGenreRegions] = useState<GenreRegionSalesItem[]>([]);
  const [publishers, setPublishers] = useState<PublisherAnalyticsItem[]>([]);
  const [globalSales, setGlobalSales] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);

    Promise.all([
      api.getSalesRanking(by, top, queryParams, controller.signal),
      api.getGenreSalesByRegion(queryParams, controller.signal),
      api.getPublishersAnalytics(8, queryParams, controller.signal),
      api.getGlobalSales(queryParams, controller.signal),
    ])
      .then(([rank, gr, pubs, gs]) => {
        setRankingData(rank);
        setGenreRegions(gr);
        setPublishers(pubs);
        setGlobalSales(gs.global_sales);
      })
      .catch(() => {})
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [by, top, queryParams]);

  const top4Genres = useMemo(() => genreRegions.slice(0, 4), [genreRegions]);

  const radarData = useMemo(() => {
    const axes: {
      axis: string;
      field: 'na_sales' | 'eu_sales' | 'jp_sales' | 'other_sales';
    }[] = [
      { axis: 'NA', field: 'na_sales' },
      { axis: 'EU', field: 'eu_sales' },
      { axis: 'JP', field: 'jp_sales' },
      { axis: 'OUT', field: 'other_sales' },
    ];
    return axes.map((a) => {
      const entry: Record<string, string | number> = { region: a.axis };
      for (const g of top4Genres) {
        entry[g.genre_name] = g.sales[a.field];
      }
      return entry;
    });
  }, [top4Genres]);

  const maxPubSales = useMemo(
    () => Math.max(...publishers.map((p) => p.global_sales), 1),
    [publishers],
  );

  const openEntityDrill = (name: string) => {
    openDrill({
      title: `${GROUP_LABELS[by]} — ${name}`,
      extraFilter:
        by === 'platform'
          ? { platform: name }
          : by === 'genre'
            ? { genre: name }
            : { publisher: name },
    });
  };

  const isEmpty = !loading && totalTitles === 0;

  return (
    <div>
      <PageTitle
        title="Rankings"
        actions={
          <div className="flex items-center gap-2">
            <div className="inline-flex rounded-lg border bg-card/70 p-0.5 text-xs">
              {([5, 10] as const).map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setTop(n)}
                  className={`rounded-md px-3 py-1 font-medium transition-colors ${
                    top === n
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Top {n}
                </button>
              ))}
            </div>

            <div className="inline-flex rounded-lg border bg-card/70 p-0.5 text-xs">
              {(['platform', 'genre', 'publisher'] as const).map((dim) => (
                <button
                  key={dim}
                  type="button"
                  onClick={() => setBy(dim)}
                  className={`rounded-md px-3 py-1 font-medium transition-colors ${
                    by === dim
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {GROUP_LABELS[dim]}
                </button>
              ))}
            </div>
          </div>
        }
      />

      {isEmpty ? (
        <EmptyState />
      ) : (
        <>
          <div className="grid grid-cols-12 gap-4">
            <Panel
              className="col-span-7"
              title={`${GROUP_LABELS[by]} por unidades vendidas`}
            >
              <div style={{ height: top * 40 + 40 }} className="w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={rankingData}
                    layout="vertical"
                    margin={{ left: 8, right: 16 }}
                    onClick={(state) => {
                      const label = state?.activeLabel;
                      if (label) openEntityDrill(String(label));
                    }}
                  >
                    <CartesianGrid {...horizontalGridProps} />
                    <XAxis type="number" {...axisProps} tickFormatter={fmtM} />
                    <YAxis
                      type="category"
                      dataKey="name"
                      width={150}
                      {...axisProps}
                    />
                    <Tooltip
                      contentStyle={tooltipStyle}
                      formatter={(val: number, name: string) => [
                        fmtUnits(Number(val)),
                        name,
                      ]}
                    />
                    {REGIONS.map((r, i) => (
                      <Bar
                        key={r.key}
                        dataKey={r.salesField}
                        name={r.label}
                        stackId="a"
                        fill={r.color}
                        radius={
                          i === REGIONS.length - 1 ? [0, 4, 4, 0] : [0, 0, 0, 0]
                        }
                        isAnimationActive={false}
                        cursor="pointer"
                      />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Panel>

            <Panel
              className="col-span-5"
              title="Top 4 gêneros por região"
            >
              <div className="h-80 w-full">
                {top4Genres.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData} outerRadius="72%">
                      <PolarGrid stroke="var(--border)" />
                      <PolarAngleAxis
                        dataKey="region"
                        tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
                      />
                      <Tooltip
                        contentStyle={tooltipStyle}
                        formatter={(val: number, name: string) => [
                          fmtUnits(Number(val)),
                          name,
                        ]}
                      />
                      {top4Genres.map((g, idx) => (
                        <Radar
                          key={g.genre_name}
                          name={g.genre_name}
                          dataKey={g.genre_name}
                          stroke={RADAR_COLORS[idx % RADAR_COLORS.length]}
                          fill={RADAR_COLORS[idx % RADAR_COLORS.length]}
                          fillOpacity={0.15}
                          strokeWidth={1.75}
                          isAnimationActive={false}
                        />
                      ))}
                    </RadarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                    Carregando gêneros…
                  </div>
                )}
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                {top4Genres.map((g, idx) => (
                  <div key={g.genre_name} className="flex items-center gap-1.5">
                    <span
                      className="h-2.5 w-2.5 rounded-[2px]"
                      style={{
                        backgroundColor:
                          RADAR_COLORS[idx % RADAR_COLORS.length],
                      }}
                    />
                    <span>{g.genre_name}</span>
                  </div>
                ))}
              </div>
            </Panel>
          </div>

          <div className="mt-4 grid grid-cols-12 gap-4">
            <Panel className="col-span-12" title="Publicadoras">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-xs">
                  <thead>
                    <tr className="border-b">
                      <th className="w-10 pb-2.5 text-left font-display text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                        #
                      </th>
                      <th className="pb-2.5 text-left font-display text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                        PUBLICADORA
                      </th>
                      <th className="pb-2.5 text-left font-display text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                        TÍTULOS
                      </th>
                      <th className="pb-2.5 text-left font-display text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                        UNIDADES GLOBAIS
                      </th>
                      <th className="w-64 pb-2.5 text-left font-display text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                        PARTICIPAÇÃO
                      </th>
                      <th className="pb-2.5 text-right font-display text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                        MÉDIA CRÍTICA
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {publishers.map((pub, idx) => {
                      const sharePct =
                        globalSales > 0
                          ? (pub.global_sales / maxPubSales) * 100
                          : 0;
                      return (
                        <tr
                          key={pub.name}
                          onClick={() =>
                            openDrill({
                              title: `Publicadora — ${pub.name}`,
                              extraFilter: { publisher: pub.name },
                            })
                          }
                          className="cursor-pointer transition-colors hover:bg-accent/50"
                        >
                          <td className="py-3 font-display font-bold text-primary tabular">
                            {idx + 1}
                          </td>
                          <td className="py-3 font-medium text-foreground">
                            {pub.name}
                          </td>
                          <td className="py-3 text-muted-foreground tabular">
                            {pub.titles.toLocaleString('pt-BR')}
                          </td>
                          <td className="py-3 font-semibold text-foreground tabular">
                            {fmtUnits(pub.global_sales)}
                          </td>
                          <td className="py-3 pr-6">
                            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                              <div
                                className="h-full rounded-full bg-primary"
                                style={{
                                  width: `${Math.min(100, sharePct)}%`,
                                }}
                              />
                            </div>
                          </td>
                          <td className="py-3 text-right">
                            <ScorePill
                              score={normalizeScore(
                                pub.critic_average_score,
                                'critic',
                              )}
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Panel>
          </div>
        </>
      )}

      <SpecBlock
        spec={{
          id: 'TELA-03',
          title: 'RANKINGS',
          objective:
            'Rankear plataformas, gêneros e publicadoras por volume de vendas regionalizado e comparar o perfil regional dos 4 maiores gêneros.',
          dataPoints: [
            'Alternância dinâmica Top 5 / Top 10 e dimensão (Plataforma, Gênero, Publicadora).',
            'Radar comparativo dos 4 principais gêneros por região.',
            'Tabela consolidada de publicadoras com títulos, vendas, participação e média crítica.',
          ],
          interactions: [
            'Clique em qualquer barra ou linha de publicadora abre o DrillDrawer com seus jogos.',
          ],
        }}
      />
    </div>
  );
}
