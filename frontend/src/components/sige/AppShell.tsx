import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Link, useNavigate, useRouterState } from '@tanstack/react-router';
import { AlertTriangle, Download, Filter, Search } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Slider } from '@/components/ui/slider';
import { DrillDrawer } from '@/components/sige/DrillDrawer';
import { api } from '@/lib/api';
import { useFilters } from '@/lib/filters';
import { fmtScore } from '@/lib/metrics';
import type { GameRow } from '@/lib/types';

function GlobalSearch() {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [gameMatches, setGameMatches] = useState<GameRow[]>([]);
  const { options, toggle } = useFilters();
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);

  const trimmed = query.trim();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (trimmed.length < 2) {
      setGameMatches([]);
      return;
    }
    const controller = new AbortController();
    const timer = setTimeout(() => {
      api
        .getGames({}, { search: trimmed, limit: 5, page: 1 }, controller.signal)
        .then((res) => setGameMatches(res.data))
        .catch(() => {
          if (!controller.signal.aborted) setGameMatches([]);
        });
    }, 180);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [trimmed]);

  const lower = trimmed.toLowerCase();
  const pubMatches = useMemo(
    () =>
      trimmed.length >= 2
        ? options.publishers
            .filter((p) => p.toLowerCase().includes(lower))
            .slice(0, 3)
        : [],
    [options.publishers, lower, trimmed.length],
  );
  const genreMatches = useMemo(
    () =>
      trimmed.length >= 2
        ? options.genres
            .filter((g) => g.toLowerCase().includes(lower))
            .slice(0, 3)
        : [],
    [options.genres, lower, trimmed.length],
  );
  const platMatches = useMemo(
    () =>
      trimmed.length >= 2
        ? options.platforms
            .filter((p) => p.toLowerCase().includes(lower))
            .slice(0, 3)
        : [],
    [options.platforms, lower, trimmed.length],
  );

  const hasResults =
    gameMatches.length > 0 ||
    pubMatches.length > 0 ||
    genreMatches.length > 0 ||
    platMatches.length > 0;

  return (
    <div ref={containerRef} className="relative">
      <div className="relative flex items-center">
        <Search className="pointer-events-none absolute left-3 h-3.5 w-3.5 text-muted-foreground" />
        <input
          id="global-search"
          name="global-search"
          type="text"
          value={query}
          onFocus={() => setOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          placeholder="Buscar jogo, publicadora…"
          aria-label="Busca geral"
          className="h-9 w-64 rounded-full border bg-card/70 pl-9 pr-4 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
        />
      </div>

      {open && trimmed.length >= 2 && (
        <div className="absolute right-0 top-11 z-50 w-80 rounded-2xl border bg-popover p-2 text-xs shadow-xl">
          {!hasResults ? (
            <div className="px-3 py-4 text-center text-muted-foreground">
              Nada encontrado para “{trimmed}”.
            </div>
          ) : (
            <div className="max-h-80 space-y-2 overflow-y-auto">
              {gameMatches.length > 0 && (
                <div>
                  <div className="hud-label px-2 py-1">Jogos</div>
                  {gameMatches.map((g) => (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => {
                        setOpen(false);
                        setQuery('');
                        navigate({
                          to: '/jogo/$id',
                          params: { id: String(g.id) },
                        });
                      }}
                      className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-accent"
                    >
                      <span className="truncate font-medium text-foreground">
                        {g.name}
                      </span>
                      <span className="ml-2 shrink-0 text-[11px] text-muted-foreground">
                        {g.platform_name}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {pubMatches.length > 0 && (
                <div>
                  <div className="hud-label px-2 py-1">Publicadoras</div>
                  {pubMatches.map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => {
                        toggle('publishers', p);
                        setOpen(false);
                      }}
                      className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-accent"
                    >
                      <span className="truncate text-foreground">{p}</span>
                      <span className="text-[10px] text-primary">Filtrar</span>
                    </button>
                  ))}
                </div>
              )}

              {genreMatches.length > 0 && (
                <div>
                  <div className="hud-label px-2 py-1">Gêneros</div>
                  {genreMatches.map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => {
                        toggle('genres', g);
                        setOpen(false);
                      }}
                      className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-accent"
                    >
                      <span className="truncate text-foreground">{g}</span>
                      <span className="text-[10px] text-primary">Filtrar</span>
                    </button>
                  ))}
                </div>
              )}

              {platMatches.length > 0 && (
                <div>
                  <div className="hud-label px-2 py-1">Plataformas</div>
                  {platMatches.map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => {
                        toggle('platforms', p);
                        setOpen(false);
                      }}
                      className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-accent"
                    >
                      <span className="truncate text-foreground">{p}</span>
                      <span className="text-[10px] text-primary">Filtrar</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ChecklistSection({
  label,
  items,
  selected,
  onToggle,
}: {
  label: string;
  items: string[];
  selected: string[];
  onToggle: (value: string) => void;
}) {
  return (
    <div>
      <div className="hud-label mb-1.5">{label}</div>
      <div className="max-h-32 space-y-0.5 overflow-y-auto rounded-xl border bg-card/60 p-1.5">
        {items.length === 0 ? (
          <div className="px-2 py-2 text-[11px] text-muted-foreground">
            Carregando…
          </div>
        ) : (
          items.map((item) => {
            const checked = selected.includes(item);
            return (
              <label
                key={item}
                className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1 text-xs transition-colors hover:bg-accent/70"
              >
                <Checkbox
                  checked={checked}
                  onCheckedChange={() => onToggle(item)}
                />
                <span className="truncate text-foreground">{item}</span>
              </label>
            );
          })
        )}
      </div>
    </div>
  );
}

function FiltersMenu() {
  const {
    filters,
    setFilters,
    toggle,
    clear,
    active,
    options,
    effectiveYearRange,
  } = useFilters();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="inline-flex h-9 items-center gap-2 rounded-full border bg-card/80 px-4 text-xs font-semibold text-foreground transition-colors hover:bg-accent"
        >
          <Filter className="h-3.5 w-3.5" />
          <span>Filtros</span>
          {active > 0 && (
            <span className="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground tabular">
              {active}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4" align="end">
        <div className="max-h-[68vh] space-y-4 overflow-y-auto pr-1">
          <ChecklistSection
            label="Publicadora"
            items={options.publishers}
            selected={filters.publishers}
            onToggle={(v) => toggle('publishers', v)}
          />
          <ChecklistSection
            label="Gênero"
            items={options.genres}
            selected={filters.genres}
            onToggle={(v) => toggle('genres', v)}
          />
          <ChecklistSection
            label="Plataforma"
            items={options.platforms}
            selected={filters.platforms}
            onToggle={(v) => toggle('platforms', v)}
          />
          <ChecklistSection
            label="ESRB"
            items={options.ratings}
            selected={filters.ratings}
            onToggle={(v) => toggle('ratings', v)}
          />

          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="hud-label">Ano de lançamento</span>
              <span className="text-xs font-semibold text-foreground tabular">
                {effectiveYearRange[0]}–{effectiveYearRange[1]}
              </span>
            </div>
            <Slider
              min={options.yearBounds[0]}
              max={options.yearBounds[1]}
              step={1}
              value={effectiveYearRange}
              onValueChange={(val) =>
                setFilters((prev) => ({
                  ...prev,
                  yearRange: [val[0], val[1]],
                }))
              }
            />
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="hud-label">Nota da crítica</span>
              <span className="text-xs font-semibold text-foreground tabular">
                {fmtScore(filters.criticRange[0])}–
                {fmtScore(filters.criticRange[1])}
              </span>
            </div>
            <Slider
              min={0}
              max={10}
              step={0.5}
              value={filters.criticRange}
              onValueChange={(val) =>
                setFilters((prev) => ({
                  ...prev,
                  criticRange: [val[0], val[1]],
                }))
              }
            />
          </div>

          {active > 0 && (
            <button
              type="button"
              onClick={clear}
              className="w-full rounded-xl border border-destructive/30 py-2 text-xs font-semibold text-destructive transition-colors hover:bg-destructive/10"
            >
              Limpar filtros ({active})
            </button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

const NAV_LINKS = [
  { to: '/', label: 'Visão Geral', exact: true },
  { to: '/mapa', label: 'Mapa de Vendas', exact: false },
  { to: '/rankings', label: 'Rankings', exact: false },
  { to: '/jogo', label: 'Jogo', exact: false },
  { to: '/relatorios', label: 'Relatórios', exact: false },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const { queryParams, apiError } = useFilters();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between gap-6 px-8">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary font-display text-sm font-black text-primary-foreground">
                S
              </span>
              <span className="font-display text-lg font-bold tracking-tight text-foreground">
                SIGE<span className="text-primary">.games</span>
              </span>
            </Link>

            <nav className="flex items-center gap-6">
              {NAV_LINKS.map((item) => {
                const isActive = item.exact
                  ? pathname === item.to
                  : pathname.startsWith(item.to);
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    data-status={isActive ? 'active' : undefined}
                    className="flex h-16 items-center border-b-2 border-transparent px-0.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground data-[status=active]:border-primary data-[status=active]:font-semibold data-[status=active]:text-foreground"
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-2.5">
            <GlobalSearch />
            <FiltersMenu />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="inline-flex h-9 items-center gap-2 rounded-full border border-primary bg-primary/5 px-4 text-xs font-semibold text-primary transition-colors hover:bg-primary/15"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Exportar</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => api.exportGamesCsv(queryParams)}
                >
                  CSV da visão atual
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    api.exportReport('pdf', queryParams, {
                      title: 'Relatório de vendas globais',
                      includeKpis: true,
                      includeRegions: true,
                      includePlatforms: true,
                      includeGenres: true,
                      includeGames: true,
                    })
                  }
                >
                  PDF da visão atual
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1600px] px-8 py-8">
        {apiError && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-score-mixed/40 bg-score-mixed/10 px-4 py-3 text-xs text-foreground">
            <AlertTriangle className="h-4 w-4 shrink-0 text-score-mixed" />
            <span>
              Não foi possível carregar dados da API ({apiError}). Certifique-se
              de que o PostgreSQL e o backend NestJS (
              <code className="font-mono">npm run start:dev</code>) estão
              rodando.
            </span>
          </div>
        )}
        {children}
      </main>

      <DrillDrawer />
    </div>
  );
}
