import { Test, TestingModule } from '@nestjs/testing';
import { vi } from 'vitest';
import { PlatformsController } from './platforms.controller.js';
import { PlatformsService } from './platforms.service.js';

describe('PlatformsController', () => {
  let controller: PlatformsController;

  const mockPlatformsService = {
    getAll: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PlatformsController],
      providers: [
        { provide: PlatformsService, useValue: mockPlatformsService },
      ],
    }).compile();

    controller = module.get<PlatformsController>(PlatformsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return all platforms', async () => {
    const expected = [{ name: 'Wii' }, { name: 'PS4' }];
    mockPlatformsService.getAll.mockResolvedValue(expected);

    const result = await controller.findAll();

    expect(result).toEqual(expected);
    expect(mockPlatformsService.getAll).toHaveBeenCalledTimes(1);
  });
});
