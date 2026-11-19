import { Controller, Get } from '@nestjs/common';
import { RatingsService } from './ratings.service.js';

@Controller('ratings')
export class RatingsController {
  constructor(private readonly ratingsService: RatingsService) {}

  @Get('')
  getAll() {return this.ratingsService.getAll();}
}
