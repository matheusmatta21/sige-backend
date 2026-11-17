import { Module } from '@nestjs/common';
import { RankingsController } from './rankings.controller.js';
import { RankingsService } from './rankings.service.js';

@Module({
  controllers: [RankingsController],
  providers: [RankingsService]
})
export class RankingsModule {}
