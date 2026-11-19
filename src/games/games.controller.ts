import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { GamesService } from './games.service.js';

@Controller('games')
export class GamesController {
  constructor(private readonly gamesService: GamesService) {}

  @Get()
  getAll(
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
    @Query('search')
    search?: string,
    @Query('limit', new ParseIntPipe({ optional: true }))
    limit?: number,
    @Query('page', new ParseIntPipe({ optional: true }))
    page?: number,
  ) {
    return this.gamesService.getAll(
      publisher,
      genre,
      platform,
      rating,
      yearFrom,
      yearTo,
      criticMin,
      criticMax,
      search,
      limit,
      page,
    );
  }

  @Get(':id')
  getById(@Param('id', ParseIntPipe) id: number) {
    return this.gamesService.getById(id);
  }
}
