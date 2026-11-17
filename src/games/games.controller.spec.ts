import { Test, TestingModule } from '@nestjs/testing';
import { vi } from 'vitest';
import { GamesController } from './games.controller.js';
import { GamesService } from './games.service.js';

describe('GamesController', () => {
  let controller: GamesController;

  const mockGamesService = {
    getAll: vi.fn(),
    getById: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [GamesController],
      providers: [{ provide: GamesService, useValue: mockGamesService }],
    }).compile();

    controller = module.get<GamesController>(GamesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return all games', async () => {
    const expected = [{ name: 'Wii Sports' }];
    mockGamesService.getAll.mockResolvedValue(expected);

    const result = await controller.getAll();

    expect(result).toEqual(expected);
    expect(mockGamesService.getAll).toHaveBeenCalledTimes(1);
  });

  it('should return a game by id', async () => {
    const expected = { name: 'Wii Sports' };
    mockGamesService.getById.mockResolvedValue(expected);

    const result = await controller.getById(1);

    expect(result).toEqual(expected);
    expect(mockGamesService.getById).toHaveBeenCalledWith(1);
  });
});
