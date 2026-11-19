import { Controller, Param, ParseIntPipe, Get } from '@nestjs/common';
import { GameAnalyticsService } from './game-analytics.service.js';

@Controller('')
export class GameAnalyticsController {
  constructor(private readonly gameAnalyticsService: GameAnalyticsService) {}

  @Get('game-details/:id')
  getGameDetails(@Param('id', ParseIntPipe) id: number) {
    return this.gameAnalyticsService.getGameDetails(id);
  }
}
