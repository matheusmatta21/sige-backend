import { Controller, Get } from '@nestjs/common';
import { SalesMapService } from './sales-map.service.js';

@Controller('')
export class SalesMapController {
    constructor(private readonly salesMapService: SalesMapService){}

    @Get('genre-sales-by-region')
    getGenreSalesByRegion() {return this.salesMapService.getGenreSalesByRegion()}
}
