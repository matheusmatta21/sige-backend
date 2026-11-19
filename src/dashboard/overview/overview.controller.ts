import { Controller, Get, Query } from '@nestjs/common';
import { OverviewService } from './overview.service.js';
import { DashboardFiltersDTO } from '../dto/dashboard-filters.dto.js';

@Controller('')
export class OverviewController {
  constructor(private readonly overviewService: OverviewService) {}

  @Get('global-sales')
  getTotalGlobalSales(@Query() filters: DashboardFiltersDTO) {
    return this.overviewService.getTotalGlobalSales(filters);
  }

  @Get('top-genres')
  getTopGenreSales(@Query() filters: DashboardFiltersDTO) {
    return this.overviewService.getTopGenreSales(filters);
  }

  @Get('average-score')
  getAverageScores(@Query() filters: DashboardFiltersDTO) {
    return this.overviewService.getAverageScores(filters);
  }

  @Get('sales-by-region')
  getSalesByRegion(@Query() filters: DashboardFiltersDTO) {
    return this.overviewService.getSalesByRegion(filters);
  }

  @Get('top-5-platforms')
  getTop5PlatformsBySales(@Query() filters: DashboardFiltersDTO) {
    return this.overviewService.getTop5PlatformsByTotalSales(filters);
  }

  @Get('sales-by-year')
  getSalesByYear(@Query() filters: DashboardFiltersDTO) {
    return this.overviewService.getSalesByYear(filters);
  }
}
