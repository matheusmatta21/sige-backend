import { Test, TestingModule } from '@nestjs/testing';
import { vi } from 'vitest';
import { PublishersController } from './publishers.controller.js';
import { PublishersService } from './publishers.service.js';

describe('PublishersController', () => {
  let controller: PublishersController;

  const mockPublishersService = {
    getAll: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PublishersController],
      providers: [
        { provide: PublishersService, useValue: mockPublishersService },
      ],
    }).compile();

    controller = module.get<PublishersController>(PublishersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return all publishers', async () => {
    const expected = [{ name: 'Nintendo' }, { name: 'Sony Computer Entertainment' }];
    mockPublishersService.getAll.mockResolvedValue(expected);

    const result = await controller.getAll();

    expect(result).toEqual(expected);
    expect(mockPublishersService.getAll).toHaveBeenCalledTimes(1);
  });
});
