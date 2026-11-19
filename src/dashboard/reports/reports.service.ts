import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { GetReportExportDTO } from './dto/get-report-export.dto.js';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async exportReport(
    publisher?: string,
    genre?: string,
    platform?: string,
    rating?: string,
    yearFrom?: number,
    yearTo?: number,
    criticMin?: number,
    criticMax?: number,
    limit?: number,
  ): Promise<GetReportExportDTO> {
    const where = {
      ...(publisher?.trim()
        ? { dim_publishers: { name: publisher.trim() } }
        : {}),
      ...(genre?.trim() ? { dim_genres: { name: genre.trim() } } : {}),
      ...(platform?.trim()
        ? { dim_platforms: { name: platform.trim() } }
        : {}),
      ...(rating?.trim() ? { dim_ratings: { name: rating.trim() } } : {}),
      year_of_release: {
        gte: yearFrom,
        lte: yearTo,
      },
      critic_score: {
        gte: criticMin,
        lte: criticMax,
      },
    };

    const summary = await this.prisma.fact_game_sales.aggregate({
      where,
      _sum: {
        global_sales: true,
        na_sales: true,
        eu_sales: true,
        jp_sales: true,
        other_sales: true,
      },
      _avg: {
        critic_score: true,
        user_score: true,
      },
      _count: {
        id: true,
      },
    });

    const platformGroup = await this.prisma.fact_game_sales.groupBy({
      by: 'platform_id',
      where: { ...where, platform_id: { not: null } },
      _sum: {
        global_sales: true,
      },
      orderBy: { _sum: { global_sales: 'desc' } },
      take: 5,
    });

    const platforms = await this.prisma.dim_platforms.findMany({
      select: { id: true, name: true },
    });
    const platformNameMap = new Map(platforms.map((item) => [item.id, item.name]));

    const genreGroup = await this.prisma.fact_game_sales.groupBy({
      by: 'genre_id',
      where: { ...where, genre_id: { not: null } },
      _sum: {
        global_sales: true,
      },
      orderBy: { _sum: { global_sales: 'desc' } },
      take: 5,
    });

    const genres = await this.prisma.dim_genres.findMany({
      select: { id: true, name: true },
    });
    const genreNameMap = new Map(genres.map((item) => [item.id, item.name]));

    const games = await this.prisma.fact_game_sales.findMany({
      where,
      select: {
        id: true,
        name: true,
        year_of_release: true,
        dim_platforms: { select: { name: true } },
        dim_genres: { select: { name: true } },
        dim_publishers: { select: { name: true } },
        dim_ratings: { select: { name: true } },
        na_sales: true,
        eu_sales: true,
        jp_sales: true,
        other_sales: true,
        global_sales: true,
        critic_score: true,
        critic_count: true,
        user_score: true,
        user_count: true,
      },
      orderBy: { global_sales: { sort: 'desc', nulls: 'last' } },
      take: limit && limit > 0 ? limit : 10,
    });

    return {
      total_titles: summary._count.id,
      global_sales: Number(summary._sum.global_sales ?? 0),
      critic_average_score: Number((summary._avg.critic_score ?? 0).toFixed(2)),
      user_average_score: Number((summary._avg.user_score ?? 0).toFixed(2)),
      sales_by_region: {
        na_sales: Number(summary._sum.na_sales ?? 0),
        eu_sales: Number(summary._sum.eu_sales ?? 0),
        jp_sales: Number(summary._sum.jp_sales ?? 0),
        other_sales: Number(summary._sum.other_sales ?? 0),
      },
      top_platforms: platformGroup.map((item) => ({
        platform_name:
          platformNameMap.get(item.platform_id as number) ?? 'Desconhecido',
        global_sales: Number(item._sum.global_sales ?? 0),
      })),
      top_genres: genreGroup.map((item) => ({
        genre_name:
          genreNameMap.get(item.genre_id as number) ?? 'Desconhecido',
        global_sales: Number(item._sum.global_sales ?? 0),
      })),
      games: games.map((game) => ({
        id: game.id,
        name: game.name,
        year_of_release: game.year_of_release,
        platform_name: game.dim_platforms?.name ?? null,
        genre_name: game.dim_genres?.name ?? null,
        publisher_name: game.dim_publishers?.name ?? null,
        rating: game.dim_ratings?.name ?? null,
        na_sales: Number(game.na_sales ?? 0),
        eu_sales: Number(game.eu_sales ?? 0),
        jp_sales: Number(game.jp_sales ?? 0),
        other_sales: Number(game.other_sales ?? 0),
        global_sales: Number(game.global_sales ?? 0),
        critic_score: game.critic_score,
        critic_count: game.critic_count,
        user_score: game.user_score,
        user_count: game.user_count,
      })),
    };
  }
}
