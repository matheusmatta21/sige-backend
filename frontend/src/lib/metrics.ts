import type { RegionKey } from './types';

export interface RegionMeta {
  key: RegionKey;
  label: string;
  short: string;
  color: string;
  salesField: 'na_sales' | 'eu_sales' | 'jp_sales' | 'other_sales';
  tableHeader: string;
}

export const REGIONS: RegionMeta[] = [
  {
    key: 'na',
    label: 'América do Norte',
    short: 'NA',
    color: 'var(--region-na)',
    salesField: 'na_sales',
    tableHeader: 'Vendas NA',
  },
  {
    key: 'eu',
    label: 'Europa',
    short: 'EU',
    color: 'var(--region-eu)',
    salesField: 'eu_sales',
    tableHeader: 'Vendas EU',
  },
  {
    key: 'jp',
    label: 'Japão',
    short: 'JP',
    color: 'var(--region-jp)',
    salesField: 'jp_sales',
    tableHeader: 'Vendas JP',
  },
  {
    key: 'other',
    label: 'Outros',
    short: 'OUT',
    color: 'var(--region-other)',
    salesField: 'other_sales',
    tableHeader: 'Outras vendas',
  },
];

export const REGION_MAP = Object.fromEntries(
  REGIONS.map((r) => [r.key, r]),
) as Record<RegionKey, RegionMeta>;

export type ScoreTone = 'good' | 'mixed' | 'bad' | 'none';

export function normalizeScore(
  value: number | null | undefined,
  kind: 'critic' | 'user',
): number | null {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return null;
  }
  const scaled = kind === 'critic' ? value / 10 : value;
  return Math.round(scaled * 10) / 10;
}

export function ratingLabel(rating: string | null | undefined): string {
  if (!rating || rating === 'Not Rated') {
    return 'Não Avaliado';
  }
  return rating;
}

export function scoreTone(score: number | null): ScoreTone {
  if (score === null) return 'none';
  if (score >= 7.5) return 'good';
  if (score >= 5.0) return 'mixed';
  return 'bad';
}

export function scoreColor(tone: ScoreTone): string {
  switch (tone) {
    case 'good':
      return 'var(--score-good)';
    case 'mixed':
      return 'var(--score-mixed)';
    case 'bad':
      return 'var(--score-bad)';
    default:
      return 'var(--muted-foreground)';
  }
}

export function toneLabel(tone: ScoreTone): string {
  switch (tone) {
    case 'good':
      return 'Aclamação';
    case 'mixed':
      return 'Mista';
    case 'bad':
      return 'Desfavorável';
    default:
      return 'Não Avaliado';
  }
}

export function fmtUnits(millions: number): string {
  return `${millions.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} M un.`;
}

export function fmtScore(score: number | null | undefined): string {
  if (score === null || score === undefined || Number.isNaN(score)) {
    return '—';
  }
  return score.toLocaleString('pt-BR', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
}

export function fmtNumber(value: number, decimals = 2): string {
  return value.toLocaleString('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}
