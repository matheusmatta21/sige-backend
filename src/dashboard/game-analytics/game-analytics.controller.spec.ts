import { Test, TestingModule } from '@nestjs/testing';
import { GameAnalyticsController } from './game-analytics.controller.js';

describe('GameAnalyticsController', () => {
  let controller: GameAnalyticsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GameAnalyticsController],
    }).compile();

    controller = module.get<GameAnalyticsController>(GameAnalyticsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
