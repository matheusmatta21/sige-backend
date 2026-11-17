import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { GenresService } from './genres.service.js';

@Controller('genres')
export class GenresController {
  constructor(private readonly GenresService: GenresService) {}
  @Get()
  getAll() {return this.GenresService.getAll();}

  @Get(':id')
  getById(@Param('id' , ParseIntPipe) id: number) {return this.GenresService.getById(id)}
}
