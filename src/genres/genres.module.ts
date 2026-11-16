import { Module } from '@nestjs/common';
import { GenresController } from './genres.controller.js';
import { GenresService } from './genres.service.js';

@Module({
  controllers: [GenresController],
  providers:[GenresService]
})
export class GenresModule {}
