import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { GetAverageScoresDTO } from './dto/get-average-scores.dto.js';
import { getTopGenreSalesDTO } from './dto/get-top-genre-sales.dto.js';
import { GetTotalGlobalSalesDTO } from './dto/get-total-global-sales.dto.js';
import { getSalesByRegionDTO } from './dto/get-sales-by-region.dto.js';
import { GetTop5PlatformsBySalesDTO } from './dto/get-top-5-platforms-by-sales.dto.js';

@Injectable()
export class OverviewService {
  constructor(private readonly prisma: PrismaService) {}

  async getTotalGlobalSales(): Promise<GetTotalGlobalSalesDTO> {
    const result = await this.prisma.fact_game_sales.aggregate({
      _sum: {
        global_sales: true,
      },
    });
    return {
      global_sales: Number(result._sum.global_sales ?? 0),
    };
  }
  async getTopGenreSales(): Promise<getTopGenreSalesDTO> {
    const games = await this.prisma.fact_game_sales.findMany({
      select: {
        global_sales: true,
        dim_genres: { select: { name: true } },
      },
    });

    const formatted_games = [];
    for (const game of games) {
      formatted_games.push({
        global_sales: Number(game.global_sales),
        genre_name: game.dim_genres?.name,
      });
    }

    const genre_array: any[] = [];

    for (const game of games) {
      if (!genre_array.includes(game.dim_genres?.name)) {
        genre_array.push(game.dim_genres?.name);
      }
    }
    const sales_array: any[] = [];

    for (const genre of genre_array) {
      const genreObject = {
        genre_name: genre,
        global_sales: 0,
      };
      for (const formattedGame of formatted_games) {
        if (genre === formattedGame.genre_name) {
          genreObject.global_sales += formattedGame.global_sales;
        }
      }
      sales_array.push(genreObject);
    }
    return sales_array.sort((a, b) => b.global_sales - a.global_sales)[0];
  }

  async getAverageScores(): Promise<GetAverageScoresDTO> {
    const result = await this.prisma.fact_game_sales.aggregate({
      _avg: {
        user_score: true,
        critic_score: true,
      },
    });

    return {
      userAverageScore: Number((result._avg.user_score ?? 0).toFixed(2)),
      criticAverageScore: Number((result._avg.critic_score ?? 0).toFixed(2)),
    };
  }

  //to-do: fazer funcao de vendas de jogos por ano de lançamento

  async getSalesByRegion(): Promise<getSalesByRegionDTO> {
    const totalSales = await this.getTotalGlobalSales();
    const sales = await this.prisma.fact_game_sales.aggregate({
      _sum: {
        na_sales: true,
        eu_sales: true,
        jp_sales: true,
        other_sales: true,
      },
    });

    const formattedSales = {
      na_sales: Number(sales._sum.na_sales),
      eu_sales: Number(sales._sum.eu_sales),
      jp_sales: Number(sales._sum.jp_sales),
      other_sales: Number(sales._sum.other_sales),
    };

    const naPercentage =
      (formattedSales.na_sales / totalSales.global_sales) * 100;
    const euPercentage =
      (formattedSales.eu_sales / totalSales.global_sales) * 100;
    const jpPercentage =
      (formattedSales.jp_sales / totalSales.global_sales) * 100;
    const otherPercentage =
      (formattedSales.other_sales / totalSales.global_sales) * 100;

    return {
      na: {
        na_sales: formattedSales.na_sales,
        na_percentage: naPercentage,
      },
      eu: {
        eu_sales: formattedSales.eu_sales,
        eu_percentage: euPercentage,
      },
      jp: {
        jp_sales: formattedSales.jp_sales,
        jp_percentage: jpPercentage,
      },
      other: {
        other_sales: formattedSales.other_sales,
        other_percentage: otherPercentage,
      },
    };
  }

  async getTop5PlatformsByTotalSales(): Promise<GetTop5PlatformsBySalesDTO[]> {
    const platformSalesIds = await this.prisma.fact_game_sales.groupBy({
      by: ['platform_id'],
      _sum: {
        global_sales: true,
      },
      where: { platform_id: { not: null } },
    });

    const platforms = await this.prisma.dim_platforms.findMany({
      select: {
        id: true,
        name: true,
      },
    });

    const platformSalesArray = [];

    for (const item of platformSalesIds) {
      const finalObject = {
        platform_name: '',
        global_sales: 0,
      };
      for (const platform of platforms) {
        if (item.platform_id === platform.id) {
          finalObject.platform_name = platform.name;
          finalObject.global_sales = Number(item._sum.global_sales);
          platformSalesArray.push(finalObject);
        }
      }
    }

    return platformSalesArray
      .sort((a, b) => b.global_sales - a.global_sales)
      .slice(0, 5);
  }
}
