import {
  Controller,
  DefaultValuePipe,
  Get,
  ParseEnumPipe,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { RankingsService, RankingGroupBy } from './rankings.service.js';

@Controller('rankings')
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
}
