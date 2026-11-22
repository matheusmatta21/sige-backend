import { useEffect, useState } from 'react';
import { FileSpreadsheet, FileText } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { PageTitle, Panel } from '@/components/sige/Panel';
import { SpecBlock } from '@/components/sige/SpecBlock';
import { api } from '@/lib/api';
import { useFilters } from '@/lib/filters';
import { fmtScore, fmtUnits, normalizeScore, REGIONS } from '@/lib/metrics';
import type { ReportPreviewResponse } from '@/lib/types';

export function RelatoriosPage() {
  const { filters, active, effectiveYearRange, queryParams } = useFilters();

  const [title, setTitle] = useState('Relatório de vendas globais');
  const [includeKpis, setIncludeKpis] = useState(true);
  const [includeRegions, setIncludeRegions] = useState(true);
  const [includePlatforms, setIncludePlatforms] = useState(true);
  const [includeGenres, setIncludeGenres] = useState(false);
  const [includeGames, setIncludeGames] = useState(true);
  const [preview, setPreview] = useState<ReportPreviewResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(() => {
      setLoading(true);
      api
        .getReportPreview(
          queryParams,
          {
            title,
            limit: 10,
            includeKpis,
            includeRegions,
            includePlatforms,
            includeGenres,
            includeGames,
          },
          controller.signal,
        )
        .then((res) => setPreview(res))
        .catch(() => {})
        .finally(() => {
          if (!controller.signal.aborted) setLoading(false);
        });
    }, 150);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [
    queryParams,
    title,
    includeKpis,
    includeRegions,
    includePlatforms,
    includeGenres,
    includeGames,
  ]);

  const today = new Date().toLocaleDateString('pt-BR');
  const maxPlatformSales = Math.max(
    ...(preview?.top_platforms.map((p) => p.global_sales) ?? [1]),
    1,
  );
  const maxGenreSales = Math.max(
    ...(preview?.top_genres.map((g) => g.global_sales) ?? [1]),
    1,
  );

  const exportOpts = {
    title,
    limit: 10,
    includeKpis,
    includeRegions,
    includePlatforms,
    includeGenres,
    includeGames,
  };

  return (
    <div>
      <PageTitle
        title="Relatórios"
        count={preview?.total_titles}
      />

      <div className="grid grid-cols-12 gap-4">
        <Panel className="col-span-4 h-fit" title="Montagem do relatório">
          <div className="space-y-5">
            <div>
              <label className="hud-label mb-1.5 block" htmlFor="report-title">
                TÍTULO
              </label>
              <input
                id="report-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="h-9 w-full rounded-lg border bg-card/80 px-3 text-xs text-foreground focus:border-primary focus:outline-none"
              />
            </div>

            <div>
              <div className="hud-label mb-1">FILTROS E PERÍODO APLICADOS</div>
              <p className="mb-2 text-[11px] text-muted-foreground">
                Ajuste no menu “Filtros” no topo da tela ({active} ativo(s)).
              </p>
              <div className="space-y-1 border-l-2 border-primary pl-2.5 text-xs text-foreground tabular">
                <div>
                  Período: {effectiveYearRange[0]}–{effectiveYearRange[1]}
                </div>
                <div>
                  Nota crítica: {fmtScore(filters.criticRange[0])}–
                  {fmtScore(filters.criticRange[1])}
                </div>
                {filters.publishers.length > 0 && (
                  <div>Publicadoras: {filters.publishers.join(', ')}</div>
                )}
                {filters.genres.length > 0 && (
                  <div>Gêneros: {filters.genres.join(', ')}</div>
                )}
                {filters.platforms.length > 0 && (
                  <div>Plataformas: {filters.platforms.join(', ')}</div>
                )}
                {filters.ratings.length > 0 && (
                  <div>ESRB: {filters.ratings.join(', ')}</div>
                )}
              </div>
            </div>

            <div>
              <div className="hud-label mb-2">SEÇÕES</div>
              <div className="space-y-2">
                {[
                  {
                    label: 'Resumo de KPIs',
                    checked: includeKpis,
                    set: setIncludeKpis,
                  },
                  {
                    label: 'Vendas por região',
                    checked: includeRegions,
                    set: setIncludeRegions,
                  },
                  {
                    label: 'Top plataformas',
                    checked: includePlatforms,
                    set: setIncludePlatforms,
                  },
                  {
                    label: 'Top gêneros',
                    checked: includeGenres,
                    set: setIncludeGenres,
                  },
                  {
                    label: 'Tabela de jogos',
                    checked: includeGames,
                    set: setIncludeGames,
                  },
                ].map((sec) => (
                  <label
                    key={sec.label}
                    className="flex cursor-pointer items-center gap-2.5 text-xs text-foreground"
                  >
                    <Checkbox
                      checked={sec.checked}
                      onCheckedChange={(val) => sec.set(Boolean(val))}
                    />
                    <span>{sec.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <div className="hud-label mb-2">EXPORTAR</div>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => api.exportReport('csv', queryParams, exportOpts)}
                  className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-primary bg-card text-xs font-semibold text-primary transition-colors hover:bg-primary/10"
                >
                  <FileSpreadsheet className="h-3.5 w-3.5" />
                  <span>CSV</span>
                </button>
                <button
                  type="button"
                  onClick={() => api.exportReport('pdf', queryParams, exportOpts)}
                  className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-primary text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90"
                >
                  <FileText className="h-3.5 w-3.5" />
                  <span>PDF</span>
                </button>
              </div>
            </div>
          </div>
        </Panel>

        <Panel className="col-span-8 p-6">
          {loading && !preview ? (
            <div className="py-16 text-center text-xs text-muted-foreground">
              Gerando pré-visualização…
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <h2 className="font-display text-lg font-bold text-foreground">
                  {preview?.title || title || 'Relatório de vendas globais'}
                </h2>
                <p className="mt-0.5 text-xs text-muted-foreground tabular">
                  {(preview?.total_titles ?? 0).toLocaleString('pt-BR')} títulos
                  · gerado em {today}
                </p>
              </div>

              {includeKpis && preview && (
                <div className="grid grid-cols-4 gap-3">
                  {[
                    {
                      label: 'UNIDADES GLOBAIS',
                      value: fmtUnits(preview.global_sales),
                    },
                    {
                      label: 'TÍTULOS',
                      value: preview.total_titles.toLocaleString('pt-BR'),
                    },
                    {
                      label: 'MÉDIA CRÍTICA',
                      value: fmtScore(
                        normalizeScore(preview.critic_average_score, 'critic'),
                      ),
                    },
                    {
                      label: 'MÉDIA USUÁRIO',
                      value: fmtScore(
                        normalizeScore(preview.user_average_score, 'user'),
                      ),
                    },
                  ].map((k) => (
                    <div
                      key={k.label}
                      className="rounded-xl border bg-card/70 p-3.5"
                    >
                      <div className="hud-label text-[9px]">{k.label}</div>
                      <div className="mt-1.5 font-display text-lg font-bold text-foreground tabular">
                        {k.value}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {includeRegions && preview && (
                <div>
                  <div className="hud-label mb-2.5">VENDAS POR REGIÃO</div>
                  <div className="space-y-2.5">
                    {REGIONS.map((r) => {
                      const val = preview.sales_by_region[r.salesField];
                      const pct =
                        preview.global_sales > 0
                          ? (val / preview.global_sales) * 100
                          : 0;
                      return (
                        <div
                          key={r.key}
                          className="grid grid-cols-[130px_1fr_95px] items-center gap-3 text-xs"
                        >
                          <span className="text-foreground">{r.label}</span>
                          <div className="h-2 overflow-hidden rounded-full bg-muted">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${Math.min(100, pct)}%`,
                                backgroundColor: r.color,
                              }}
                            />
                          </div>
                          <span className="text-right font-semibold text-foreground tabular">
                            {fmtUnits(val)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {includePlatforms && preview && (
                <div>
                  <div className="hud-label mb-2.5">TOP 5 PLATAFORMAS</div>
                  <div className="space-y-2.5">
                    {preview.top_platforms.map((p) => {
                      const pct = (p.global_sales / maxPlatformSales) * 100;
                      return (
                        <div
                          key={p.platform_name}
                          className="grid grid-cols-[130px_1fr_95px] items-center gap-3 text-xs"
                        >
                          <span className="truncate text-foreground">
                            {p.platform_name}
                          </span>
                          <div className="h-2 overflow-hidden rounded-full bg-muted">
                            <div
                              className="h-full rounded-full bg-primary"
                              style={{ width: `${Math.min(100, pct)}%` }}
                            />
                          </div>
                          <span className="text-right font-semibold text-foreground tabular">
                            {fmtUnits(p.global_sales)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {includeGenres && preview && (
                <div>
                  <div className="hud-label mb-2.5">TOP 5 GÊNEROS</div>
                  <div className="space-y-2.5">
                    {preview.top_genres.map((g) => {
                      const pct = (g.global_sales / maxGenreSales) * 100;
                      return (
                        <div
                          key={g.genre_name}
                          className="grid grid-cols-[130px_1fr_95px] items-center gap-3 text-xs"
                        >
                          <span className="truncate text-foreground">
                            {g.genre_name}
                          </span>
                          <div className="h-2 overflow-hidden rounded-full bg-muted">
                            <div
                              className="h-full rounded-full bg-primary"
                              style={{ width: `${Math.min(100, pct)}%` }}
                            />
                          </div>
                          <span className="text-right font-semibold text-foreground tabular">
                            {fmtUnits(g.global_sales)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {includeGames && preview && (
                <div>
                  <div className="hud-label mb-2.5">
                    JOGOS ({preview.games.length} DE{' '}
                    {preview.total_titles.toLocaleString('pt-BR')})
                  </div>
                  <table className="w-full border-collapse text-xs">
                    <thead>
                      <tr className="border-b">
                        <th className="pb-2 text-left font-display text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                          JOGO
                        </th>
                        <th className="pb-2 text-left font-display text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                          PLATAFORMA
                        </th>
                        <th className="pb-2 text-left font-display text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                          ANO
                        </th>
                        <th className="pb-2 text-right font-display text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                          GLOBAL
                        </th>
                        <th className="pb-2 text-right font-display text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                          CRÍTICA
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {preview.games.map((g) => (
                        <tr key={g.id}>
                          <td className="py-2 font-medium text-foreground">
                            {g.name}
                          </td>
                          <td className="py-2 text-muted-foreground">
                            {g.platform_name ?? '—'}
                          </td>
                          <td className="py-2 text-muted-foreground tabular">
                            {g.year_of_release ?? '—'}
                          </td>
                          <td className="py-2 text-right font-semibold text-foreground tabular">
                            {fmtUnits(g.global_sales)}
                          </td>
                          <td className="py-2 text-right text-foreground tabular">
                            {fmtScore(normalizeScore(g.critic_score, 'critic'))}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </Panel>
      </div>

      <SpecBlock
        spec={{
          id: 'TELA-05',
          title: 'RELATÓRIOS',
          objective:
            'Configurar, pré-visualizar e exportar relatórios executivos em CSV ou PDF respeitando os filtros globais e seções selecionadas.',
          dataPoints: [
            'Resumo de KPIs, vendas por região, Top 5 plataformas, Top 5 gêneros e amostra dos principais jogos.',
          ],
          interactions: [
            'Edição ao vivo do título e seleção de seções atualizam a pré-visualização instantaneamente.',
            'Botões CSV e PDF geram download direto pelo backend.',
          ],
        }}
      />
    </div>
  );
}
