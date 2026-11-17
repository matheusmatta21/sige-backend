import { Test, TestingModule } from '@nestjs/testing';
import { vi } from 'vitest';
import { PrismaService } from '../prisma/prisma.service.js';
import { GenresService } from './genres.service.js';

describe('GenresService', () => {
  let service: GenresService;

  const mockPrismaService = {
    dim_genres: {
      findMany: vi.fn(),
    },
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GenresService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<GenresService>(GenresService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return all genres', async () => {
    const expected = [{ name: 'Action' }, { name: 'Sports' }];
    mockPrismaService.dim_genres.findMany.mockResolvedValue(expected);

    const result = await service.getAll();

    expect(result).toEqual(expected);
    expect(mockPrismaService.dim_genres.findMany).toHaveBeenCalledWith({
      select: { name: true },
    });
  });
});
