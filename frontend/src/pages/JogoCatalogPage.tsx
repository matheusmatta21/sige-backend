import { useEffect, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { EsrbBadge } from '@/components/sige/EsrbBadge';
import { EmptyState, PageTitle } from '@/components/sige/Panel';
import { ScorePill } from '@/components/sige/Scores';
import { SpecBlock } from '@/components/sige/SpecBlock';
import { api } from '@/lib/api';
import { useFilters } from '@/lib/filters';
import { fmtUnits, normalizeScore } from '@/lib/metrics';
import type { GameRow } from '@/lib/types';

const PAGE_SIZE = 48;

export function JogoCatalogPage() {
  const { queryParams } = useFilters();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [games, setGames] = useState<GameRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 200);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [queryParams]);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);

    api
      .getGames(
        queryParams,
        {
          search: debouncedSearch || undefined,
          limit: PAGE_SIZE,
          page,
          sortBy: 'global_sales',
          order: 'desc',
        },
        controller.signal,
      )
      .then((res) => {
        setGames(res.data);
        setTotal(res.total);
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setGames([]);
          setTotal(0);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [queryParams, debouncedSearch, page]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div>
      <PageTitle
        title="Escolha um jogo"
        count={total}
        actions={
          <input
            id="catalog-search"
            name="catalog-search"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filtrar por nome…"
            className="h-9 w-72 rounded-full border bg-card/80 px-4 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
          />
        }
      />

      {!loading && games.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <div className="grid grid-cols-4 gap-4">
            {games.map((g) => (
              <Link
                key={g.id}
                to="/jogo/$id"
                params={{ id: String(g.id) }}
                className="hud-panel flex flex-col justify-between gap-3 p-4"
              >
                <div className="flex items-start gap-3">
                  <EsrbBadge rating={g.rating} size="sm" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-display text-sm font-semibold text-foreground">
                      {g.name}
                    </div>
                    <div className="mt-0.5 truncate text-xs text-muted-foreground">
                      {[g.platform_name, g.year_of_release, g.genre_name]
                        .filter(Boolean)
                        .join(' · ')}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-foreground tabular">
                    {fmtUnits(g.global_sales)}
                  </span>
                  <ScorePill
                    score={normalizeScore(g.critic_score, 'critic')}
                  />
                </div>
              </Link>
            ))}
          </div>

          {total > PAGE_SIZE && (
            <div className="mt-6 flex items-center justify-between text-xs text-muted-foreground">
              <span className="tabular">
                Página {page} de {totalPages} ·{' '}
                {total.toLocaleString('pt-BR')} títulos encontrados
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="rounded-lg border bg-card px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-45"
                >
                  Anterior
                </button>
                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="rounded-lg border bg-card px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-45"
                >
                  Próxima
                </button>
              </div>
            </div>
          )}
        </>
      )}

      <SpecBlock
        spec={{
          id: 'TELA-04',
          title: 'CATÁLOGO DE JOGOS',
          objective:
            'Permitir navegação rápida pelo catálogo ordenado por vendas globais e acesso imediato à ficha analítica individual.',
          dataPoints: [
            'Classificação ESRB, plataforma, ano, gênero, unidades globais e nota crítica.',
          ],
          interactions: [
            'Filtro textual por nome/publicadora/gênero combinado com os filtros globais.',
            'Clique em qualquer card abre a tela de detalhe do título.',
          ],
        }}
      />
    </div>
  );
}
