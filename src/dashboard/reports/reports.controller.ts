import { Controller, Get, ParseIntPipe, Query } from '@nestjs/common';
import { ReportsService } from './reports.service.js';

@Controller('')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('export')
  exportReport(
    @Query('publisher')
    publisher?: string,
    @Query('genre')
    genre?: string,
    @Query('platform')
    platform?: string,
    @Query('rating')
    rating?: string,
    @Query('yearFrom', new ParseIntPipe({ optional: true }))
    yearFrom?: number,
    @Query('yearTo', new ParseIntPipe({ optional: true }))
    yearTo?: number,
    @Query('criticMin', new ParseIntPipe({ optional: true }))
    criticMin?: number,
    @Query('criticMax', new ParseIntPipe({ optional: true }))
    criticMax?: number,
    @Query('limit', new ParseIntPipe({ optional: true }))
    limit?: number,
  ) {
    return this.reportsService.exportReport(
      publisher,
      genre,
      platform,
      rating,
      yearFrom,
      yearTo,
      criticMin,
      criticMax,
      limit,
    );
  }
}
