import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { OverviewService } from './overview.service.js';

@ApiTags('Dashboard')
@Controller('')
export class OverviewController {
    constructor(private readonly overviewService: OverviewService){}

    @Get('global-sales')
    getAllGlobalSales() {return this.overviewService.getAllGlobalSales()}

    @Get('top-genres')
    getTopGenreSales() {return this.overviewService.getTopGenreSales()}

    @Get('average-score')
    getAverageScores() {return this.overviewService.getAverageScores()}
}
