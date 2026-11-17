import { Module } from '@nestjs/common';
import { SalesMapController } from './sales-map.controller.js';
import { SalesMapService } from './sales-map.service.js';

@Module({
  controllers: [SalesMapController],
  providers: [SalesMapService]
})
export class SalesMapModule {}
