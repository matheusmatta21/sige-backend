import type { ReactNode } from 'react';
import { useFilters } from '@/lib/filters';
import { cn } from '@/lib/utils';

export function Panel({
  title,
  action,
  children,
  className,
}: {
  title?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn('hud-panel p-5', className)}>
      {(title || action) && (
        <header className="mb-4 flex items-center justify-between gap-2">
          {title ? (
            <h2 className="font-display text-sm font-semibold tracking-tight text-foreground">
              {title}
            </h2>
          ) : (
            <span />
          )}
          {action}
        </header>
      )}
      {children}
    </section>
  );
}

export function KpiCard({
  label,
  value,
  sub,
  className,
}: {
  label: string;
  value: string;
  sub?: string;
  className?: string;
}) {
  return (
    <div className={cn('hud-panel flex flex-col justify-between p-5', className)}>
      <span className="hud-label">{label}</span>
      <div className="my-2 font-display text-2xl font-bold tracking-tight text-foreground tabular">
        {value}
      </div>
      {sub && <span className="text-xs text-muted-foreground">{sub}</span>}
    </div>
  );
}

export function TitleCount({ count }: { count?: number | null }) {
  const { totalTitles } = useFilters();
  const value = count !== undefined ? count : totalTitles;

  return (
    <span className="inline-flex items-center gap-1 rounded-full border bg-card/80 px-3 py-0.5 text-xs text-muted-foreground tabular">
      <strong className="font-semibold text-foreground">
        {value !== null ? value.toLocaleString('pt-BR') : '—'}
      </strong>{' '}
      títulos
    </span>
  );
}

export function PageTitle({
  title,
  count,
  showCount = true,
  actions,
}: {
  title: string;
  count?: number | null;
  showCount?: boolean;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-6 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
          {title}
        </h1>
        {showCount && <TitleCount count={count} />}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

export function EmptyState({
  title = 'Sem resultados',
  description = 'Nenhum jogo corresponde aos filtros atuais.',
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div className="hud-panel flex flex-col items-center justify-center p-12 text-center">
      <p className="font-display text-base font-semibold text-foreground">
        {title}
      </p>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
