import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { GetPlatformsDTO } from './dto/get-platforms.dto.js';

@Injectable()
export class PlatformsService {
  constructor(private readonly prisma: PrismaService) {}

  async getAll(): Promise<GetPlatformsDTO[]> {
    return this.prisma.dim_platforms.findMany({
      select: {
        name: true,
      },
    });
  }
}
