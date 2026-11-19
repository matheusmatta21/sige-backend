import {
  Controller,
  DefaultValuePipe,
  Get,
  ParseBoolPipe,
  ParseEnumPipe,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { ReportFormat, ReportsService } from './reports.service.js';

@Controller('')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('preview')
  getPreview(
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
    @Query('title', new DefaultValuePipe('Relatório de vendas globais'))
    title?: string,
    @Query('includeKpis', new DefaultValuePipe(true), ParseBoolPipe)
    includeKpis?: boolean,
    @Query('includeRegions', new DefaultValuePipe(true), ParseBoolPipe)
    includeRegions?: boolean,
    @Query('includePlatforms', new DefaultValuePipe(true), ParseBoolPipe)
    includePlatforms?: boolean,
    @Query('includeGenres', new DefaultValuePipe(true), ParseBoolPipe)
    includeGenres?: boolean,
    @Query('includeGames', new DefaultValuePipe(true), ParseBoolPipe)
    includeGames?: boolean,
  ) {
    return this.reportsService.getReportData(
      publisher,
      genre,
      platform,
      rating,
      yearFrom,
      yearTo,
      criticMin,
      criticMax,
      limit,
      title,
      includeKpis,
      includeRegions,
      includePlatforms,
      includeGenres,
      includeGames,
    );
  }

  @Get('export')
  exportReport(
    @Query(
      'format',
      new DefaultValuePipe('csv'),
      new ParseEnumPipe(ReportFormat),
    )
    format: ReportFormat,
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
    @Query('title', new DefaultValuePipe('Relatório de vendas globais'))
    title?: string,
    @Query('includeKpis', new DefaultValuePipe(true), ParseBoolPipe)
    includeKpis?: boolean,
    @Query('includeRegions', new DefaultValuePipe(true), ParseBoolPipe)
    includeRegions?: boolean,
    @Query('includePlatforms', new DefaultValuePipe(true), ParseBoolPipe)
    includePlatforms?: boolean,
    @Query('includeGenres', new DefaultValuePipe(true), ParseBoolPipe)
    includeGenres?: boolean,
    @Query('includeGames', new DefaultValuePipe(true), ParseBoolPipe)
    includeGames?: boolean,
  ) {
    return this.reportsService.exportReport(
      format,
      publisher,
      genre,
      platform,
      rating,
      yearFrom,
      yearTo,
      criticMin,
      criticMax,
      limit,
      title,
      includeKpis,
      includeRegions,
      includePlatforms,
      includeGenres,
      includeGames,
    );
  }
}
