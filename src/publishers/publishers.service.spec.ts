import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { vi } from 'vitest';
import { PrismaService } from '../prisma/prisma.service.js';
import { PublishersService } from './publishers.service.js';

describe('PublishersService', () => {
  let service: PublishersService;

  const mockPrismaService = {
    dim_publishers: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
    },
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PublishersService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<PublishersService>(PublishersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return all publishers', async () => {
    const expected = [{ name: 'Nintendo' }, { name: 'Electronic Arts' }];
    mockPrismaService.dim_publishers.findMany.mockResolvedValue(expected);

    const result = await service.getAll();

    expect(result).toEqual(expected);
    expect(mockPrismaService.dim_publishers.findMany).toHaveBeenCalledWith({
      select: { name: true },
    });
  });

  it('should return a publisher on getById', async () => {
    const expected = { name: 'Nintendo' };
    mockPrismaService.dim_publishers.findUnique.mockResolvedValue(expected);

    const result = await service.getById(1);

    expect(result).toEqual(expected);
    expect(mockPrismaService.dim_publishers.findUnique).toHaveBeenCalledWith({
      select: { name: true },
      where: { id: 1 },
    });
  });

  it('should throw NotFoundException when publisher does not exist', async () => {
    mockPrismaService.dim_publishers.findUnique.mockResolvedValue(null);

    await expect(service.getById(999999)).rejects.toThrow(NotFoundException);
  });
});
