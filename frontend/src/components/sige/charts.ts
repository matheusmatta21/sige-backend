import type { CSSProperties } from 'react';

export const axisProps = {
  tick: { fill: 'var(--muted-foreground)', fontSize: 11 },
  axisLine: false,
  tickLine: false,
} as const;

export const gridProps = {
  stroke: 'var(--border)',
  strokeDasharray: '3 3',
  vertical: false,
} as const;

export const horizontalGridProps = {
  stroke: 'var(--border)',
  strokeDasharray: '3 3',
  horizontal: false,
} as const;

export const tooltipStyle: CSSProperties = {
  backgroundColor: 'var(--popover)',
  border: '1px solid var(--border)',
  borderRadius: '0.75rem',
  fontSize: '12px',
  color: 'var(--foreground)',
  boxShadow: 'var(--glow)',
};

export function fmtM(v: number | string): string {
  return `${Math.round(Number(v))}M`;
}
