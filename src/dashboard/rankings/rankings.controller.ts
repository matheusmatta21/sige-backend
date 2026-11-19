import {
  Controller,
  DefaultValuePipe,
  Get,
  ParseEnumPipe,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { RankingsService, RankingGroupBy } from './rankings.service.js';

@Controller('')
export class RankingsController {
  constructor(private readonly rankingsService: RankingsService) {}

  @Get('sales')
  getSalesRanking(
    @Query(
      'by',
      new DefaultValuePipe('platform'),
      new ParseEnumPipe(RankingGroupBy),
    )
    by: RankingGroupBy,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe)
    limit: number,
  ) {
    return this.rankingsService.getSalesRanking(by, limit);
  }

  @Get('publishers')
  getPublishersAnalytics(
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.rankingsService.getPublishersAnalytics(limit);
  }
}
