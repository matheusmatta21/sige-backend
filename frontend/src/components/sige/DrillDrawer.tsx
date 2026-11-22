import { useEffect, useMemo, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { ArrowDown, ArrowUp, Download } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { ScorePill } from '@/components/sige/Scores';
import { api, type FilterQueryParams } from '@/lib/api';
import { useFilters } from '@/lib/filters';
import {
  fmtNumber,
  fmtUnits,
  normalizeScore,
  REGION_MAP,
} from '@/lib/metrics';
import type { GameRow } from '@/lib/types';

type SortCol =
  | 'name'
  | 'platform'
  | 'year_of_release'
  | 'genre'
  | 'publisher'
  | 'na_sales'
  | 'eu_sales'
  | 'jp_sales'
  | 'other_sales'
  | 'global_sales'
  | 'critic_score'
  | 'user_score';

const PAGE_SIZE = 10;

export function DrillDrawer() {
  const { drill, closeDrill, queryParams } = useFilters();
  const [sortBy, setSortBy] = useState<SortCol>('global_sales');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState<GameRow[]>([]);
  const [total, setTotal] = useState(0);
  const [totalVolume, setTotalVolume] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!drill) return;
    setSortBy('global_sales');
    setOrder('desc');
    setPage(1);
  }, [drill]);

  const mergedParams = useMemo<FilterQueryParams>(() => {
    if (!drill) return queryParams;
    const ef = drill.extraFilter;
    return {
      ...queryParams,
      ...(ef?.publisher ? { publishers: [ef.publisher] } : {}),
      ...(ef?.genre ? { genres: [ef.genre] } : {}),
      ...(ef?.platform ? { platforms: [ef.platform] } : {}),
      ...(ef?.yearFrom !== undefined ? { yearFrom: ef.yearFrom } : {}),
      ...(ef?.yearTo !== undefined ? { yearTo: ef.yearTo } : {}),
    };
  }, [drill, queryParams]);

  useEffect(() => {
    if (!drill) return;
    const controller = new AbortController();
    setLoading(true);

    const gamesReq = api.getGames(
      mergedParams,
      { limit: PAGE_SIZE, page, sortBy, order },
      controller.signal,
    );

    const volumeReq = drill.region
      ? api.getSalesByRegion(mergedParams, controller.signal).then((r) => {
          switch (drill.region) {
            case 'na':
              return r.na.na_sales;
            case 'eu':
              return r.eu.eu_sales;
            case 'jp':
              return r.jp.jp_sales;
            case 'other':
              return r.other.other_sales;
            default:
              return 0;
          }
        })
      : api
          .getGlobalSales(mergedParams, controller.signal)
          .then((r) => r.global_sales);

    Promise.all([gamesReq, volumeReq])
      .then(([gamesRes, vol]) => {
        setRows(gamesRes.data);
        setTotal(gamesRes.total);
        setTotalVolume(vol);
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setRows([]);
          setTotal(0);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [drill, mergedParams, page, sortBy, order]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const regionMeta = drill?.region ? REGION_MAP[drill.region] : null;

  const handleSort = (col: SortCol) => {
    setPage(1);
    if (sortBy === col) {
      setOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'));
    } else {
      setSortBy(col);
      setOrder(col === 'name' ? 'asc' : 'desc');
    }
  };

  const renderSortHeader = (
    label: string,
    col: SortCol,
    align: 'left' | 'right' = 'left',
  ) => {
    const active = sortBy === col;
    return (
      <th
        className={`pb-2.5 font-display text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground ${
          align === 'right' ? 'text-right' : 'text-left'
        }`}
      >
        <button
          type="button"
          onClick={() => handleSort(col)}
          className={`inline-flex items-center gap-1 transition-colors hover:text-foreground ${
            active ? 'text-foreground' : ''
          }`}
        >
          <span>{label}</span>
          {active &&
            (order === 'desc' ? (
              <ArrowDown className="h-3 w-3" />
            ) : (
              <ArrowUp className="h-3 w-3" />
            ))}
        </button>
      </th>
    );
  };

  return (
    <Sheet open={!!drill} onOpenChange={(open) => !open && closeDrill()}>
      <SheetContent className="w-[1000px] max-w-[90vw]">
        {drill && (
          <>
            <SheetHeader className="pr-10">
              <SheetTitle>{drill.title}</SheetTitle>
              <SheetDescription className="tabular">
                {total.toLocaleString('pt-BR')} títulos · {fmtUnits(totalVolume)}{' '}
                {regionMeta ? `em ${regionMeta.short}` : 'globais'}
              </SheetDescription>
            </SheetHeader>

            <div className="mt-3 flex justify-end">
              <button
                type="button"
                onClick={() =>
                  api.exportGamesCsv(mergedParams, { sortBy, order })
                }
                className="inline-flex items-center gap-1.5 rounded-lg border bg-card px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-accent"
              >
                <Download className="h-3.5 w-3.5" />
                Exportar CSV
              </button>
            </div>

            <div className="mt-4 flex-1 overflow-auto">
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr className="border-b">
                    {renderSortHeader('JOGO', 'name')}
                    {renderSortHeader('PLATAFORMA', 'platform')}
                    {renderSortHeader('ANO', 'year_of_release')}
                    {renderSortHeader('GÊNERO', 'genre')}
                    {renderSortHeader('PUBLICADORA', 'publisher')}
                    {regionMeta &&
                      renderSortHeader(
                        regionMeta.tableHeader.toUpperCase(),
                        regionMeta.salesField,
                        'right',
                      )}
                    {renderSortHeader('GLOBAL', 'global_sales', 'right')}
                    {renderSortHeader('CRÍTICA', 'critic_score', 'right')}
                    {renderSortHeader('USUÁRIO', 'user_score', 'right')}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {loading && rows.length === 0 ? (
                    <tr>
                      <td
                        colSpan={regionMeta ? 9 : 8}
                        className="py-10 text-center text-muted-foreground"
                      >
                        Carregando jogos…
                      </td>
                    </tr>
                  ) : rows.length === 0 ? (
                    <tr>
                      <td
                        colSpan={regionMeta ? 9 : 8}
                        className="py-10 text-center text-muted-foreground"
                      >
                        Nenhum título encontrado.
                      </td>
                    </tr>
                  ) : (
                    rows.map((g) => (
                      <tr
                        key={g.id}
                        className="transition-colors hover:bg-accent/50"
                      >
                        <td className="max-w-[230px] truncate py-2.5 pr-3 font-medium text-foreground">
                          <Link
                            to="/jogo/$id"
                            params={{ id: String(g.id) }}
                            onClick={closeDrill}
                            className="hover:text-primary hover:underline"
                          >
                            {g.name}
                          </Link>
                        </td>
                        <td className="py-2.5 pr-3 text-muted-foreground">
                          {g.platform_name ?? '—'}
                        </td>
                        <td className="py-2.5 pr-3 text-muted-foreground tabular">
                          {g.year_of_release ?? '—'}
                        </td>
                        <td className="py-2.5 pr-3 text-muted-foreground">
                          {g.genre_name ?? '—'}
                        </td>
                        <td className="max-w-[150px] truncate py-2.5 pr-3 text-muted-foreground">
                          {g.publisher_name ?? '—'}
                        </td>
                        {regionMeta && (
                          <td className="py-2.5 pl-3 text-right text-foreground tabular">
                            {fmtNumber(g[regionMeta.salesField])}
                          </td>
                        )}
                        <td className="py-2.5 pl-3 text-right font-semibold text-foreground tabular">
                          {fmtNumber(g.global_sales)}
                        </td>
                        <td className="py-2.5 pl-3 text-right">
                          <ScorePill
                            score={normalizeScore(g.critic_score, 'critic')}
                          />
                        </td>
                        <td className="py-2.5 pl-3 text-right">
                          <ScorePill
                            score={normalizeScore(g.user_score, 'user')}
                          />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex items-center justify-between border-t pt-3 text-xs text-muted-foreground">
              <span>
                Página {page} de {totalPages} · valores em milhões de unidades
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
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
