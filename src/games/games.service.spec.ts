import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { vi } from 'vitest';
import { PrismaService } from '../prisma/prisma.service.js';
import { GamesService } from './games.service.js';

describe('GamesService', () => {
  let service: GamesService;

  const mockPrismaService = {
    fact_game_sales: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
    },
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GamesService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<GamesService>(GamesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return formatted games on getAll', async () => {
    mockPrismaService.fact_game_sales.findMany.mockResolvedValue([
      {
        name: 'Wii Sports',
        year_of_release: 2006,
        dim_platforms: { name: 'Wii' },
        dim_genres: { name: 'Sports' },
        dim_publishers: { name: 'Nintendo' },
        dim_ratings: { name: 'E' },
        na_sales: '41.36',
        eu_sales: '28.96',
        jp_sales: '3.77',
        other_sales: '8.45',
        global_sales: '82.53',
        critic_score: 76,
        critic_count: 51,
        user_score: 8,
        user_count: 322,
      },
    ]);

    const result = await service.getAll();

    expect(result).toEqual([
      {
        name: 'Wii Sports',
        year_of_release: 2006,
        platform_name: 'Wii',
        genre_name: 'Sports',
        publisher_name: 'Nintendo',
        rating: 'E',
        na_sales: 41.36,
        eu_sales: 28.96,
        jp_sales: 3.77,
        other_sales: 8.45,
        global_sales: 82.53,
        critic_score: 76,
        critic_count: 51,
        user_score: 8,
        user_count: 322,
      },
    ]);
  });

  it('should return a formatted game on getById', async () => {
    mockPrismaService.fact_game_sales.findUnique.mockResolvedValue({
      name: 'Super Mario Bros.',
      year_of_release: 1985,
      dim_platforms: { name: 'NES' },
      dim_genres: { name: 'Platform' },
      dim_publishers: { name: 'Nintendo' },
      dim_ratings: null,
      na_sales: '29.08',
      eu_sales: '3.58',
      jp_sales: '6.81',
      other_sales: '0.77',
      global_sales: '40.24',
      critic_score: null,
      critic_count: null,
      user_score: null,
      user_count: null,
    });

    const result = await service.getById(2);

    expect(result.name).toBe('Super Mario Bros.');
    expect(result.rating).toBeNull();
    expect(result.na_sales).toBe(29.08);
    expect(mockPrismaService.fact_game_sales.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 2 } }),
    );
  });

  it('should throw NotFoundException when game does not exist', async () => {
    mockPrismaService.fact_game_sales.findUnique.mockResolvedValue(null);

    await expect(service.getById(999999)).rejects.toThrow(NotFoundException);
  });
});
