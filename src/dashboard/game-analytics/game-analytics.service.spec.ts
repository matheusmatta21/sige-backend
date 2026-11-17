import { Test, TestingModule } from '@nestjs/testing';
import { GameAnalyticsService } from './game-analytics.service.js';

describe('GameAnalyticsService', () => {
  let service: GameAnalyticsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GameAnalyticsService],
    }).compile();

    service = module.get<GameAnalyticsService>(GameAnalyticsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
