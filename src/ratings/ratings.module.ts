import { Module } from '@nestjs/common';
import { RatingsController } from './ratings.controller.js';
import { RatingsService } from './ratings.service.js';

@Module({
  controllers: [RatingsController],
  providers: [RatingsService]
})
export class RatingsModule {}
