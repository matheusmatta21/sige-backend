import { Test, TestingModule } from '@nestjs/testing';
import { vi } from 'vitest';
import { PrismaService } from '../prisma/prisma.service.js';
import { PublishersService } from './publishers.service.js';

describe('PublishersService', () => {
  let service: PublishersService;

  const mockPrismaService = {
    dim_publishers: {
      findMany: vi.fn(),
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
});
