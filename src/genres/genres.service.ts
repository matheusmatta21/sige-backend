import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { GetGenreDTO } from './dto/get-genres.dto.js';

@Injectable()
export class GenresService {
  constructor(private readonly prisma: PrismaService) {}
  async getAll(): Promise<GetGenreDTO[]> {
    return this.prisma.dim_genres.findMany({
      select: {
        name: true,
      },
    });
  }
  async getById(id: number): Promise<GetGenreDTO> {
    const genre = await this.prisma.dim_genres.findUnique({
      select: { name: true },
      where: { id },
    });
    if (!genre) {
      throw new NotFoundException(`Gênero com id ${id} não encontrado`);
    }

    return genre;
  }
}
