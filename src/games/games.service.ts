import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { GetGamesDTO } from './dto/get-games.dto.js';
import { GameFromDb } from './types/game-from-db.js';

const GAME_SELECT = {
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
};
@Injectable()
export class GamesService {
  constructor(private readonly prisma: PrismaService) {}

  private formatGame(game: GameFromDb) : GetGamesDTO {
    const newGame = {
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
      };
      return newGame;
    }

  async getAll(): Promise<GetGamesDTO[]> {
    const games = await this.prisma.fact_game_sales.findMany({
      select: GAME_SELECT
    });
    return games.map((game) => this.formatGame(game))
  }

  async getById(id: number): Promise<GetGamesDTO> {
    const game = await this.prisma.fact_game_sales.findUnique({
      select: GAME_SELECT,
      where: { id },
    });
    if (!game) {
        throw new NotFoundException(`Jogo com id ${id} não encontrado`);
      }

    return this.formatGame(game);
  }
}
