import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { GetAverageScoresDTO } from './dto/get-average-scores.dto.js';
import { getTopGenreSalesDTO } from './dto/get-top-genre-sales.dto.js';
import { GetTotalGlobalSalesDTO } from './dto/get-total-global-sales.dto.js';

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
}
