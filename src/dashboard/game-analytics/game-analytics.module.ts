import { Module } from '@nestjs/common';
import { GameAnalyticsController } from './game-analytics.controller.js';
import { GameAnalyticsService } from './game-analytics.service.js';

@Module({
  controllers: [GameAnalyticsController],
  providers: [GameAnalyticsService]
})
export class GameAnalyticsModule {}
