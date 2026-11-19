import { Controller, Get, Query } from '@nestjs/common';
import { SalesMapService } from './sales-map.service.js';
import { DashboardFiltersDTO } from '../dto/dashboard-filters.dto.js';

@Controller('')
export class SalesMapController {
  constructor(private readonly salesMapService: SalesMapService) {}

  @Get('genre-sales-by-region')
  getGenreSalesByRegion(@Query() filters: DashboardFiltersDTO) {
    return this.salesMapService.getGenreSalesByRegion(filters);
  }
}
