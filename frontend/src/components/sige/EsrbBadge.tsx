import { cn } from '@/lib/utils';

const ESRB_DESCRIPTIONS: Record<string, string> = {
  E: 'Livre para todos',
  'E10+': '10 anos ou mais',
  T: 'Adolescentes (13+)',
  M: 'Adultos (17+)',
  AO: 'Apenas adultos (18+)',
  EC: 'Primeira infância',
  'K-A': 'Crianças e adultos',
  RP: 'Classificação pendente',
};

export function EsrbBadge({
  rating,
  size = 'sm',
}: {
  rating: string | null | undefined;
  size?: 'sm' | 'lg';
}) {
  const isUnrated = !rating || rating === 'Not Rated';
  const code = isUnrated ? 'N/A' : rating;
  const description = isUnrated
    ? 'Não avaliado'
    : (ESRB_DESCRIPTIONS[code] ?? code);

  if (size === 'lg') {
    if (isUnrated) {
      return (
        <div className="flex items-center gap-4">
          <div className="flex h-28 w-20 flex-col items-center justify-center rounded-md border-2 border-dashed border-muted-foreground/50 p-2 text-center">
            <span className="font-display text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              NÃO AVALIADO
            </span>
          </div>
          <div>
            <div className="hud-label">CLASSIFICAÇÃO</div>
            <div className="mt-0.5 text-sm font-semibold text-foreground">
              {description}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-4">
        <div className="flex h-28 w-20 flex-col justify-between overflow-hidden rounded-md border-[3px] border-foreground bg-white text-foreground shadow-xs">
          <div className="flex flex-1 items-center justify-center px-1">
            <span
              className={cn(
                'font-display font-black leading-none tracking-tight',
                code.length > 2 ? 'text-2xl' : 'text-4xl',
              )}
            >
              {code}
            </span>
          </div>
          <div className="bg-foreground py-1 text-center font-display text-[10px] font-bold tracking-widest text-white">
            ESRB
          </div>
        </div>
        <div>
          <div className="hud-label">CLASSIFICAÇÃO</div>
          <div className="mt-0.5 text-sm font-semibold text-foreground">
            {description}
          </div>
        </div>
      </div>
    );
  }

  if (isUnrated) {
    return (
      <div className="flex h-10 w-8 shrink-0 items-center justify-center rounded-sm border border-dashed border-muted-foreground/50 text-[10px] font-semibold text-muted-foreground">
        N/A
      </div>
    );
  }

  return (
    <div className="flex h-10 w-8 shrink-0 flex-col justify-between overflow-hidden rounded-sm border-2 border-foreground/85 bg-white text-foreground">
      <div className="flex flex-1 items-center justify-center">
        <span
          className={cn(
            'font-display font-black leading-none',
            code.length > 2 ? 'text-[10px]' : 'text-sm',
          )}
        >
          {code}
        </span>
      </div>
      <div className="bg-foreground py-[1px] text-center font-display text-[6px] font-bold tracking-wider text-white">
        ESRB
      </div>
    </div>
  );
}
