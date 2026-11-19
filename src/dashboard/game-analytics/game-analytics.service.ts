import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { platform } from 'os';

@Injectable()
export class GameAnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getGameDetails(id: number) {
    const gameInfo = await this.prisma.fact_game_sales.findUnique({
      where: { id },
      select: {
        name: true,
        dim_platforms: { select: { name: true } },
        dim_genres: { select: { name: true } },
        dim_publishers: { select: { name: true } },
        genre_id: true,
        dim_ratings: { select: { name: true } },
        year_of_release: true,
        critic_score: true,
        critic_count: true,
        user_score: true,
        user_count: true,
        na_sales: true,
        eu_sales: true,
        jp_sales: true,
        global_sales: true,
        other_sales: true,
      },
    });

    if (!gameInfo) {
      throw new NotFoundException(`Jogo com id ${id} não encontrado`);
    }

    const selectedGenreAverages = await this.prisma.fact_game_sales.aggregate({
      _avg: {
        global_sales: true,
        critic_score: true,
        user_score: true,
      },
      where: { genre_id: gameInfo?.genre_id },
    });

    const naSalesPercentage = (
      (Number(gameInfo?.na_sales) / Number(gameInfo?.global_sales)) *
      100
    ).toFixed(2);
    const euSalesPercentage = (
      (Number(gameInfo?.eu_sales) / Number(gameInfo?.global_sales)) *
      100
    ).toFixed(2);
    const jpSalesPercentage = (
      (Number(gameInfo?.jp_sales) / Number(gameInfo?.global_sales)) *
      100
    ).toFixed(2);
    const otherSalesPercentage = (
      (Number(gameInfo?.other_sales) / Number(gameInfo?.global_sales)) *
      100
    ).toFixed(2);

    const diffGlobalSalesPercentage = (
      (Number(gameInfo.global_sales) /
        Number(selectedGenreAverages._avg.global_sales)) *
      100
    ).toFixed(2);
    const diffCriticScorePercentage = (
      (Number(gameInfo.critic_score) /
        Number(selectedGenreAverages._avg.critic_score)) *
      100
    ).toFixed(2);
    const diffUserScorePercentage = (
      (Number(gameInfo.user_score) /
        Number(selectedGenreAverages._avg.user_score)) *
      100
    ).toFixed(2);
    return {
      name: gameInfo.name,
      platform_name: gameInfo.dim_platforms?.name,
      genre_name: gameInfo.dim_genres?.name,
      publisher_name: gameInfo.dim_publishers?.name,
      rating: gameInfo.dim_ratings?.name,
      year_of_release: gameInfo.year_of_release,
      critic_score: gameInfo.critic_score,
      critic_count: gameInfo.critic_count,
      average_genre_critic_score: selectedGenreAverages._avg.critic_score,
      diff_critic_score_percentage: Number(diffCriticScorePercentage),
      user_score: gameInfo.user_score,
      user_count: gameInfo.user_count,
      average_genre_user_score: selectedGenreAverages._avg.user_score,
      diff_user_score_percentage: Number(diffUserScorePercentage),
      na_sales: Number(gameInfo.na_sales),
      na_sales_percentage: Number(naSalesPercentage),
      eu_sales_percentage: Number(euSalesPercentage),
      jp_sales_percentage: Number(jpSalesPercentage),
      other_sales_percentage: Number(otherSalesPercentage),
      eu_sales: Number(gameInfo.eu_sales),
      jp_sales: Number(gameInfo.jp_sales),
      global_sales: Number(gameInfo.global_sales),
      average_genre_global_sales: Number(
        selectedGenreAverages._avg.global_sales,
      ),
      diff_global_sales_percentage: Number(diffGlobalSalesPercentage),
      other_sales: Number(gameInfo.other_sales),
    };
  }
}
