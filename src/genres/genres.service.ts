import { Injectable } from '@nestjs/common';
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
}
