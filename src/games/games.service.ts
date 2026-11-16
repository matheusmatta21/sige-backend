import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { GetGamesDTO } from './dto/get-games.dto.js';

type DimensionTable =
  'dim_genres' | 'dim_platforms' | 'dim_publishers' | 'dim_ratings';

@Injectable()
export class GamesService {
  constructor(private readonly prisma: PrismaService) {}

  async getAll(): Promise<GetGamesDTO[]> {
    const games = await this.prisma.fact_game_sales.findMany({ });
    const formatted_games = [];

    for (const element of games) {
      const number_array_ids = [
        element.platform_id,
        element.genre_id,
        element.rating_id,
        element.publisher_id,
      ];
      const order_tables: DimensionTable[] = [
        'dim_platforms',
        'dim_genres',
        'dim_ratings',
        'dim_publishers',
      ];
      const name_array: (string | null)[] = [];

      for (let i = 0; i < number_array_ids.length; i++) {
        name_array.push(
          await this.getNameById(number_array_ids[i], order_tables[i]),
        );
      }

      const [platformName, genreName, ratingName, publisherName] = name_array;

      formatted_games.push({
        name: element.name,
        year_of_release: element.year_of_release,
        platform_name: platformName,
        genre_name: genreName,
        publisher_name: publisherName,
        rating: ratingName,
        na_sales: Number(element.na_sales ?? 0),
        eu_sales: Number(element.eu_sales ?? 0),
        jp_sales: Number(element.jp_sales ?? 0),
        other_sales: Number(element.other_sales ?? 0),
        global_sales: Number(element.global_sales ?? 0),
        critic_score: element.critic_score,
        critic_count: element.critic_count,
        user_score: element.user_score,
        user_count: element.user_count,
      });
    }

    return formatted_games;
  }

  async getNameById(id: number | null, table: DimensionTable) {
    if (id === null) return null;

    let result: { name: string } | null;
    switch (table) {
      case 'dim_genres':
        result = await this.prisma.dim_genres.findUnique({
          select: { name: true },
          where: { id },
        });
        break;
      case 'dim_platforms':
        result = await this.prisma.dim_platforms.findUnique({
          select: { name: true },
          where: { id },
        });
        break;
      case 'dim_publishers':
        result = await this.prisma.dim_publishers.findUnique({
          select: { name: true },
          where: { id },
        });
        break;
      case 'dim_ratings':
        result = await this.prisma.dim_ratings.findUnique({
          select: { name: true },
          where: { id },
        });
        break;
    }
    return result?.name ?? null;
  }
}
