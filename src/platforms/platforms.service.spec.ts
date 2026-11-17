import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { vi } from 'vitest';
import { PrismaService } from '../prisma/prisma.service.js';
import { PlatformsService } from './platforms.service.js';

describe('PlatformsService', () => {
  let service: PlatformsService;

  const mockPrismaService = {
    dim_platforms: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
    },
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PlatformsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<PlatformsService>(PlatformsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return all platforms', async () => {
    const expected = [{ name: 'Wii' }, { name: 'PS4' }];
    mockPrismaService.dim_platforms.findMany.mockResolvedValue(expected);

    const result = await service.getAll();

    expect(result).toEqual(expected);
    expect(mockPrismaService.dim_platforms.findMany).toHaveBeenCalledWith({
      select: { name: true },
    });
  });

  it('should return a platform on getById', async () => {
    const expected = { name: 'Wii' };
    mockPrismaService.dim_platforms.findUnique.mockResolvedValue(expected);

    const result = await service.getById(1);

    expect(result).toEqual(expected);
    expect(mockPrismaService.dim_platforms.findUnique).toHaveBeenCalledWith({
      select: { name: true },
      where: { id: 1 },
    });
  });

  it('should throw NotFoundException when platform does not exist', async () => {
    mockPrismaService.dim_platforms.findUnique.mockResolvedValue(null);

    await expect(service.getById(999999)).rejects.toThrow(NotFoundException);
  });
});
