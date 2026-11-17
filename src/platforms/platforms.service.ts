import { Injectable, NotFoundException } from '@nestjs/common';
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
  async getById(id: number): Promise<GetPlatformsDTO> {
    const platform = await this.prisma.dim_platforms.findUnique({
      select: {
        name: true,
      },
      where: { id },
    });
    if (!platform) {
      throw new NotFoundException(`Plataforma com id ${id} não encontrada`);
    }

    return platform;
  }
}
