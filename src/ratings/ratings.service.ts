import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { GetRatingsDTO } from './dto/get-ratings.dto.js';

@Injectable()
export class RatingsService {
  constructor(private readonly prisma: PrismaService) {}

  getAll(): Promise<GetRatingsDTO[]> {
    return this.prisma.dim_ratings.findMany({
      select: { name: true },
    });
  }
}
