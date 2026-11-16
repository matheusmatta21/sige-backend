import { Controller, Get } from '@nestjs/common';
import { GamesService } from './games.service.js';

@Controller('games')
export class GamesController {
    constructor(private readonly gamesService: GamesService){}

    @Get()
    getAll() {
        return this.gamesService.getAll()
    }
}
