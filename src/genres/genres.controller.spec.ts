import { Test, TestingModule } from '@nestjs/testing';
import { vi } from 'vitest';
import { GenresController } from './genres.controller.js';
import { GenresService } from './genres.service.js';

describe('GenresController', () => {
  let controller: GenresController;

  const mockGenresService = {
    getAll: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [GenresController],
      providers: [{ provide: GenresService, useValue: mockGenresService }],
    }).compile();

    controller = module.get<GenresController>(GenresController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return all genres', async () => {
    const expected = [{ name: 'Action' }, { name: 'RPG' }];
    mockGenresService.getAll.mockResolvedValue(expected);

    const result = await controller.getAll();

    expect(result).toEqual(expected);
    expect(mockGenresService.getAll).toHaveBeenCalledTimes(1);
  });
});
