import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from '@tanstack/react-router';
import { Cell, Pie, PieChart, Tooltip } from 'recharts';
import { tooltipStyle } from '@/components/sige/charts';
import { EsrbBadge } from '@/components/sige/EsrbBadge';
import { EmptyState, Panel } from '@/components/sige/Panel';
import { ScoreBar, ScoreCircle, ScoreSquare } from '@/components/sige/Scores';
import { SpecBlock } from '@/components/sige/SpecBlock';
import { api } from '@/lib/api';
import {
  fmtScore,
  fmtUnits,
  normalizeScore,
  REGION_MAP,
  scoreTone,
  toneLabel,
} from '@/lib/metrics';
import type { GameDetailsResponse, GameRow } from '@/lib/types';

export function JogoDetailPage() {
  const { id } = useParams({ from: '/jogo/$id' });
  const numericId = Number(id);

  const [details, setDetails] = useState<GameDetailsResponse | null>(null);
  const [currentGame, setCurrentGame] = useState<GameRow | null>(null);
  const [siblingGames, setSiblingGames] = useState<GameRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!Number.isFinite(numericId)) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    setLoading(true);
    setNotFound(false);

    Promise.all([
      api.getGameDetails(numericId, controller.signal),
      api.getGameById(numericId, controller.signal),
    ])
      .then(([det, gameRow]) => {
        setDetails(det);
        setCurrentGame(gameRow);
        return api
          .getGames(
            {},
            { search: det.name, limit: 25, page: 1 },
            controller.signal,
          )
          .then((siblings) => {
            const exact = siblings.data.filter((s) => s.name === det.name);
            setSiblingGames(exact);
          });
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setNotFound(true);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [numericId]);

  const platformChips = useMemo(() => {
    if (!details) return [];
    const byName = new Map<string, number | null>();
    for (const s of siblingGames) {
      if (s.platform_name && !byName.has(s.platform_name)) {
        byName.set(s.platform_name, s.id);
      }
    }
    if (details.platforms.length > 0) {
      return details.platforms.map((p) => ({
        name: p.platform_name,
        id: byName.get(p.platform_name) ?? null,
        active: currentGame?.platform_name === p.platform_name,
      }));
    }
    return currentGame?.platform_name
      ? [{ name: currentGame.platform_name, id: currentGame.id, active: true }]
      : [];
  }, [details, siblingGames, currentGame]);

  const regionSlices = useMemo(() => {
    if (!details) return [];
    return [
      {
        key: 'na',
        label: REGION_MAP.na.label,
        color: REGION_MAP.na.color,
        sales: details.na_sales,
        pct: details.na_sales_percentage || 0,
      },
      {
        key: 'eu',
        label: REGION_MAP.eu.label,
        color: REGION_MAP.eu.color,
        sales: details.eu_sales,
        pct: details.eu_sales_percentage || 0,
      },
      {
        key: 'jp',
        label: REGION_MAP.jp.label,
        color: REGION_MAP.jp.color,
        sales: details.jp_sales,
        pct: details.jp_sales_percentage || 0,
      },
      {
        key: 'other',
        label: REGION_MAP.other.label,
        color: REGION_MAP.other.color,
        sales: details.other_sales,
        pct: details.other_sales_percentage || 0,
      },
    ];
  }, [details]);

  if (loading) {
    return (
      <div className="hud-panel p-12 text-center text-sm text-muted-foreground">
        Carregando análise do jogo…
      </div>
    );
  }

  if (notFound || !details) {
    return (
      <div>
        <Link
          to="/jogo"
          className="hud-label mb-4 inline-flex items-center gap-1 hover:text-primary"
        >
          ← Catálogo
        </Link>
        <EmptyState
          title="Jogo não encontrado"
          description="O título solicitado não existe ou foi removido."
        />
      </div>
    );
  }

  const normCritic = normalizeScore(details.critic_score, 'critic');
  const normUser = normalizeScore(details.user_score, 'user');
  const criticTone = scoreTone(normCritic);
  const userTone = scoreTone(normUser);

  const normGenreCritic = normalizeScore(
    details.average_genre_critic_score,
    'critic',
  );
  const normGenreUser = normalizeScore(
    details.average_genre_user_score,
    'user',
  );

  const calcDelta = (
    val: number | null | undefined,
    avg: number | null | undefined,
  ): number | null => {
    if (
      val === null ||
      val === undefined ||
      avg === null ||
      avg === undefined ||
      avg === 0
    ) {
      return null;
    }
    return Math.round(((val - avg) / avg) * 100);
  };

  const salesDelta = calcDelta(
    details.global_sales,
    details.average_genre_global_sales,
  );
  const criticDelta = calcDelta(normCritic, normGenreCritic);
  const userDelta = calcDelta(normUser, normGenreUser);

  const comparisons = [
    {
      label: 'UNIDADES GLOBAIS',
      delta: salesDelta,
      gameVal: details.global_sales,
      avgVal: details.average_genre_global_sales,
      gameText: fmtUnits(details.global_sales),
      avgText: fmtUnits(details.average_genre_global_sales),
    },
    {
      label: 'NOTA DA CRÍTICA',
      delta: criticDelta,
      gameVal: normCritic ?? 0,
      avgVal: normGenreCritic ?? 0,
      gameText: fmtScore(normCritic),
      avgText: fmtScore(normGenreCritic),
    },
    {
      label: 'NOTA DO USUÁRIO',
      delta: userDelta,
      gameVal: normUser ?? 0,
      avgVal: normGenreUser ?? 0,
      gameText: fmtScore(normUser),
      avgText: fmtScore(normGenreUser),
    },
  ];

  return (
    <div>
      <Link
        to="/jogo"
        className="hud-label mb-4 inline-flex items-center gap-1 transition-colors hover:text-primary"
      >
        ← Catálogo
      </Link>

      <section className="hud-panel flex items-center justify-between gap-6 p-6">
        <div className="flex items-center gap-6">
          <div className="flex h-40 w-32 shrink-0 items-end rounded-xl border bg-gradient-to-br from-primary/35 via-surface-2 to-region-eu/35 p-3">
            <span className="font-display text-[11px] font-black uppercase leading-tight text-foreground">
              {details.name}
            </span>
          </div>

          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">
              {details.name}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {[
                details.publisher_name,
                details.genre_name,
                details.year_of_release,
              ]
                .filter(Boolean)
                .join(' · ')}
            </p>

            {platformChips.length > 0 && (
              <div className="mt-3 flex flex-wrap items-center gap-1.5">
                {platformChips.map((chip) =>
                  chip.id && !chip.active ? (
                    <Link
                      key={chip.name}
                      to="/jogo/$id"
                      params={{ id: String(chip.id) }}
                      className="rounded-md border bg-card/80 px-2.5 py-0.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/60 hover:text-foreground"
                    >
                      {chip.name}
                    </Link>
                  ) : (
                    <span
                      key={chip.name}
                      className={`rounded-md border px-2.5 py-0.5 text-xs font-medium ${
                        chip.active
                          ? 'border-primary bg-primary/5 font-semibold text-primary'
                          : 'bg-card/80 text-muted-foreground'
                      }`}
                    >
                      {chip.name}
                    </span>
                  ),
                )}
              </div>
            )}

            <div className="mt-4 flex items-baseline gap-2">
              <span className="font-display text-2xl font-bold text-primary tabular">
                {fmtUnits(details.global_sales)}
              </span>
              <span className="text-xs text-muted-foreground">
                vendidas no mundo
              </span>
            </div>
          </div>
        </div>

        <EsrbBadge rating={details.rating} size="lg" />
      </section>

      <div className="mt-4 grid grid-cols-12 gap-4">
        <Panel className="col-span-5" title="Notas">
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <ScoreSquare rawScore={details.critic_score} />
              <div className="min-w-0 flex-1">
                <div className="font-display text-sm font-semibold text-foreground">
                  Metascore
                </div>
                <div className="mb-2 text-xs text-muted-foreground tabular">
                  {toneLabel(criticTone)} · {fmtScore(normCritic)} / 10,0
                </div>
                <ScoreBar score={normCritic} />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <ScoreCircle score={normUser} />
              <div className="min-w-0 flex-1">
                <div className="font-display text-sm font-semibold text-foreground">
                  User Score
                </div>
                <div className="mb-2 text-xs text-muted-foreground tabular">
                  {toneLabel(userTone)} · {fmtScore(normUser)} / 10,0
                </div>
                <ScoreBar score={normUser} />
              </div>
            </div>
          </div>
        </Panel>

        <Panel className="col-span-7" title="Vendas por região">
          <div className="flex items-center gap-8">
            <div className="shrink-0">
              <PieChart width={192} height={192}>
                <Pie
                  data={regionSlices}
                  dataKey="sales"
                  nameKey="label"
                  cx="50%"
                  cy="50%"
                  innerRadius={48}
                  outerRadius={78}
                  paddingAngle={2}
                  startAngle={90}
                  endAngle={-270}
                  isAnimationActive={false}
                >
                  {regionSlices.map((s) => (
                    <Cell key={s.key} fill={s.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(val: number) => fmtUnits(Number(val))}
                />
              </PieChart>
            </div>

            <div className="flex-1 space-y-3">
              {regionSlices.map((s) => (
                <div key={s.key}>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="text-foreground">{s.label}</span>
                    <span className="tabular">
                      <strong className="font-semibold text-foreground">
                        {fmtUnits(s.sales)}
                      </strong>{' '}
                      <span className="text-muted-foreground">
                        · {s.pct.toFixed(1)}%
                      </span>
                    </span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${Math.min(100, s.pct)}%`,
                        backgroundColor: s.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Panel>
      </div>

      <div className="mt-4 grid grid-cols-12 gap-4">
        <Panel className="col-span-12" title="Jogo vs. média do gênero">
          <div className="grid grid-cols-3 gap-8">
            {comparisons.map((item) => {
              const max = Math.max(item.gameVal, item.avgVal, 0.01);
              const gamePct = (item.gameVal / max) * 100;
              const avgPct = (item.avgVal / max) * 100;

              return (
                <div key={item.label} className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="hud-label">{item.label}</span>
                    {item.delta !== null && (
                      <span
                        className={`font-display text-xs font-bold tabular ${
                          item.delta >= 0 ? 'text-primary' : 'text-destructive'
                        }`}
                      >
                        {item.delta >= 0 ? `+${item.delta}%` : `${item.delta}%`}
                      </span>
                    )}
                  </div>

                  <div>
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Este jogo</span>
                      <span className="font-semibold text-foreground tabular">
                        {item.gameText}
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${Math.min(100, gamePct)}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">
                        Média do gênero
                      </span>
                      <span className="font-semibold text-foreground tabular">
                        {item.avgText}
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-muted-foreground/80"
                        style={{ width: `${Math.min(100, avgPct)}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Panel>
      </div>

      <SpecBlock
        spec={{
          id: 'TELA-04',
          title: 'JOGO',
          objective:
            'Apresentar a ficha completa do título: plataformas disponíveis, classificação ESRB, Metascore vs. User Score, divisão regional e benchmark contra a média do gênero.',
          dataPoints: [
            'Notas normalizadas na escala 0–10 com faixa de avaliação (Aclamação, Mista, Desfavorável).',
            'Participação regional em milhões de unidades e percentual.',
            'Comparativo percentual de vendas e notas frente à média do gênero.',
          ],
          interactions: [
            'Clique nos chips de plataforma alterna entre versões do mesmo título.',
          ],
        }}
      />
    </div>
  );
}
