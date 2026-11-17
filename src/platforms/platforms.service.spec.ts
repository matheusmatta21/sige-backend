import { Test, TestingModule } from '@nestjs/testing';
import { vi } from 'vitest';
import { PrismaService } from '../prisma/prisma.service.js';
import { PlatformsService } from './platforms.service.js';

describe('PlatformsService', () => {
  let service: PlatformsService;

  const mockPrismaService = {
    dim_platforms: {
      findMany: vi.fn(),
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
});
