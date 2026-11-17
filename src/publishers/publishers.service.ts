import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { GetPublishersDTO } from './dto/get-publishers.dto.js';

@Injectable()
export class PublishersService {
  constructor(private readonly prisma: PrismaService) {}

  async getAll(): Promise<GetPublishersDTO[]> {
    return this.prisma.dim_publishers.findMany({
      select: {
        name: true,
      },
    });
  }
  async getById(id: number): Promise<GetPublishersDTO> {
    const publisher = await this.prisma.dim_publishers.findUnique({
      select: { name: true },
      where: { id },
    });
    if (!publisher) {
      throw new NotFoundException(`Publisher com id ${id} não encontrado`);
    }

    return publisher;
  }
}
