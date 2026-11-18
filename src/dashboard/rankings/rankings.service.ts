import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { Prisma } from '../../generated/prisma/client.js';
import { GetSalesRankingDTO } from './dto/get-sales-ranking.dto.js';
import { GetPublishersAnalyticsDTO } from './dto/get-publishers-analytics.dto.js';

export enum RankingGroupBy {
  PLATFORM = 'platform',
  GENRE = 'genre',
  PUBLISHER = 'publisher',
}

@Injectable()
export class RankingsService {
  constructor(private readonly prisma: PrismaService) {}

  async getSalesRanking(
    by: string,
    limit: number,
  ): Promise<GetSalesRankingDTO[]> {
    let groupByField: Prisma.Fact_game_salesScalarFieldEnum;

    switch (by) {
      case 'platform': {
        groupByField = Prisma.Fact_game_salesScalarFieldEnum.platform_id;
        break;
      }

      case 'genre': {
        groupByField = Prisma.Fact_game_salesScalarFieldEnum.genre_id;
        break;
      }

      case 'publisher': {
        groupByField = Prisma.Fact_game_salesScalarFieldEnum.publisher_id;
        break;
      }
      default:
        groupByField = Prisma.Fact_game_salesScalarFieldEnum.platform_id;
    }
    const salesGroup = await this.prisma.fact_game_sales.groupBy({
      by: groupByField as any,
      _sum: {
        na_sales: true,
        eu_sales: true,
        jp_sales: true,
        global_sales: true,
        other_sales: true,
      },
      where: { [groupByField]: { not: null } },
      orderBy: { _sum: { global_sales: 'desc' } },
      take: limit,
    });

    const ids = salesGroup
      .map((item) => item[groupByField] as number)
      .filter((id) => id !== null);

    let idNamed: { id: number; name: string }[] = [];

    switch (groupByField) {
      case 'platform_id': {
        idNamed = await this.prisma.dim_platforms.findMany({
          where: { id: { in: ids } },
          select: { name: true, id: true },
        });
        break;
      }
      case 'genre_id': {
        idNamed = await this.prisma.dim_genres.findMany({
          where: { id: { in: ids } },
          select: { name: true, id: true },
        });
        break;
      }
      case 'publisher_id': {
        idNamed = await this.prisma.dim_publishers.findMany({
          where: { id: { in: ids } },
          select: { name: true, id: true },
        });
        break;
      }
    }

    const nameById = new Map(idNamed.map((item) => [item.id, item.name]));
    console.log(nameById);

    return salesGroup.map((item) => {
      const id = item[groupByField] as number;
      return {
        name: nameById.get(id) ?? 'Desconhecido',
        na_sales: Number(item._sum.na_sales ?? 0),
        eu_sales: Number(item._sum.eu_sales ?? 0),
        jp_sales: Number(item._sum.jp_sales ?? 0),
        other_sales: Number(item._sum.other_sales ?? 0),
        global_sales: Number(item._sum.global_sales ?? 0),
      };
    });
  }

  async getPublishersAnalytics(
    limit: number,
  ): Promise<GetPublishersAnalyticsDTO[]> {
    const result = await this.prisma.fact_game_sales.groupBy({
      by: 'publisher_id',
      _sum: {
        global_sales: true,
      },
      _count: {
        id: true,
      },
      _avg: {
        critic_score: true,
        user_score: true,
      },
      orderBy: { _sum: { global_sales: 'desc' } },
      take: limit,
    });

    const publisherNames = await this.prisma.dim_publishers.findMany({
      select: {
        id: true,
        name: true,
      },
    });

    const resultMapped = new Map(
      publisherNames.map((item) => [item.id, item.name]),
    );

    return result.map((item) => {
      const id = item.publisher_id as number;
      return {
        name: resultMapped.get(id) ?? 'Desconhecido',
        titles: item._count.id,
        global_sales: Number(item._sum.global_sales ?? 0),
        critic_average_score:
          item._avg.critic_score !== null
            ? Number(item._avg.critic_score.toFixed(2))
            : null,
        user_average_score:
          item._avg.user_score !== null
            ? Number(item._avg.user_score.toFixed(2))
            : null,
      };
    });
  }
}
