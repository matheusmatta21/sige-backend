import { fmtScore, scoreColor, scoreTone } from '@/lib/metrics';
import { cn } from '@/lib/utils';

export function ScoreRing({
  score,
  label,
  size = 104,
}: {
  score: number | null;
  label: string;
  size?: number;
}) {
  const tone = scoreTone(score);
  const color = scoreColor(tone);
  const strokeWidth = 6;
  const r = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * r;
  const pct = score !== null ? Math.max(0, Math.min(1, score / 10)) : 0;
  const offset = circumference * (1 - pct);

  return (
    <div className="flex flex-col items-center">
      <div
        className="relative flex items-center justify-center"
        style={{ width: size, height: size }}
      >
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="var(--muted)"
            strokeWidth={strokeWidth}
          />
          {score !== null && (
            <circle
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
            />
          )}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="font-display text-2xl font-bold leading-none text-foreground tabular">
            {fmtScore(score)}
          </span>
          <span className="mt-0.5 text-[10px] text-muted-foreground tabular">
            / 10,0
          </span>
        </div>
      </div>
      <span className="hud-label mt-2">{label}</span>
    </div>
  );
}

export function ScoreSquare({ rawScore }: { rawScore: number | null }) {
  const normalized = rawScore !== null ? rawScore / 10 : null;
  const tone = scoreTone(normalized);
  const bg =
    tone === 'none' ? 'var(--muted-foreground)' : scoreColor(tone);

  return (
    <div
      className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl font-display text-3xl font-black text-white tabular"
      style={{ backgroundColor: bg }}
    >
      {rawScore !== null ? Math.round(rawScore) : '—'}
    </div>
  );
}

export function ScoreCircle({ score }: { score: number | null }) {
  const tone = scoreTone(score);
  const bg =
    tone === 'none' ? 'var(--muted-foreground)' : scoreColor(tone);

  return (
    <div
      className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full font-display text-2xl font-black text-white tabular"
      style={{ backgroundColor: bg }}
    >
      {fmtScore(score)}
    </div>
  );
}

export function ScoreBar({ score }: { score: number | null }) {
  const tone = scoreTone(score);
  const color = scoreColor(tone);
  const pct = score !== null ? Math.max(0, Math.min(100, (score / 10) * 100)) : 0;

  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
      <div
        className="h-full rounded-full transition-all"
        style={{ width: `${pct}%`, backgroundColor: color }}
      />
    </div>
  );
}

export function ScorePill({
  score,
  className,
}: {
  score: number | null;
  className?: string;
}) {
  const tone = scoreTone(score);
  const bg =
    tone === 'none' ? 'color-mix(in oklab, var(--muted-foreground) 75%, transparent)' : scoreColor(tone);

  return (
    <span
      className={cn(
        'inline-flex min-w-[2.25rem] items-center justify-center rounded-md px-1.5 py-0.5 font-display text-xs font-bold text-white tabular',
        className,
      )}
      style={{ backgroundColor: bg }}
    >
      {fmtScore(score)}
    </span>
  );
}
