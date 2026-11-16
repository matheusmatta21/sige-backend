import { Controller, Get } from '@nestjs/common';
import { GenresService } from './genres.service.js';

@Controller('genres')
export class GenresController {
  constructor(private readonly GenresService: GenresService) {}
  @Get()
  getAll() {
    return this.GenresService.getAll();
  }
}
