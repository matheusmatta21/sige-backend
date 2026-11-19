import { BadRequestException } from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client.js';
import { DashboardFiltersDTO } from '../dto/dashboard-filters.dto.js';

function toStringList(value?: string | string[]): string[] | undefined {
  if (value === undefined) {
    return undefined;
  }

  const rawItems = Array.isArray(value) ? value : value.split(',');
  const cleaned = rawItems.map((item) => item.trim()).filter(Boolean);

  return cleaned.length > 0 ? cleaned : undefined;
}

function toOptionalNumber(
  value: number | string | undefined,
  fieldName: string,
): number | undefined {
  if (value === undefined || value === '') {
    return undefined;
  }

  const parsed = Number(value);
  if (Number.isNaN(parsed)) {
    throw new BadRequestException(
      `O parâmetro "${fieldName}" deve ser um número válido.`,
    );
  }

  return parsed;
}

export function buildSalesWhere(
  filters: DashboardFiltersDTO = {},
  baseWhere: Prisma.fact_game_salesWhereInput = {},
): Prisma.fact_game_salesWhereInput {
  const publishers = toStringList(filters.publisher);
  const genres = toStringList(filters.genre);
  const platforms = toStringList(filters.platform);
  const ratings = toStringList(filters.rating);

  const yearFrom = toOptionalNumber(filters.yearFrom, 'yearFrom');
  const yearTo = toOptionalNumber(filters.yearTo, 'yearTo');
  const criticMin = toOptionalNumber(filters.criticMin, 'criticMin');
  const criticMax = toOptionalNumber(filters.criticMax, 'criticMax');

  const filterWhere: Prisma.fact_game_salesWhereInput = {
    ...(publishers ? { dim_publishers: { name: { in: publishers } } } : {}),
    ...(genres ? { dim_genres: { name: { in: genres } } } : {}),
    ...(platforms ? { dim_platforms: { name: { in: platforms } } } : {}),
    ...(ratings ? { dim_ratings: { name: { in: ratings } } } : {}),
    ...(yearFrom !== undefined || yearTo !== undefined
      ? {
          year_of_release: {
            ...(yearFrom !== undefined ? { gte: yearFrom } : {}),
            ...(yearTo !== undefined ? { lte: yearTo } : {}),
          },
        }
      : {}),
    ...(criticMin !== undefined || criticMax !== undefined
      ? {
          critic_score: {
            ...(criticMin !== undefined ? { gte: criticMin } : {}),
            ...(criticMax !== undefined ? { lte: criticMax } : {}),
          },
        }
      : {}),
  };

  if (Object.keys(baseWhere).length === 0) {
    return filterWhere;
  }

  if (Object.keys(filterWhere).length === 0) {
    return baseWhere;
  }

  return { AND: [baseWhere, filterWhere] };
}
