import { Controller, Get } from '@nestjs/common';
import { OverviewService } from './overview.service.js';

@Controller('')
export class OverviewController {
    constructor(private readonly overviewService: OverviewService){}

    @Get('global-sales')
    getTotalGlobalSales() {return this.overviewService.getTotalGlobalSales()}

    @Get('top-genres')
    getTopGenreSales() {return this.overviewService.getTopGenreSales()}

    @Get('average-score')
    getAverageScores() {return this.overviewService.getAverageScores()}

    @Get('units-by-region')
    getSalesByRegion() {return this.overviewService.getSalesByRegion()}

    @Get('top-5-platforms')
    getTop5PlatformsBySales() {return this.overviewService.getTop5PlatformsByTotalSales()}
}
