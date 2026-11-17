import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { GamesService } from './games.service.js';

@Controller('games')
export class GamesController {
    constructor(private readonly gamesService: GamesService){}

    @Get()
    getAll() {return this.gamesService.getAll()}

    @Get(':id')
    getById(@Param('id', ParseIntPipe) id: number) {return this.gamesService.getById(id)}
}
