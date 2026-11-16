import { Module } from '@nestjs/common';
import { PublishersService } from './publishers.service.js';
import { PublishersController } from './publishers.controller.js';

@Module({
    controllers:[PublishersController],
    providers:[PublishersService]
})
export class PublishersModule {}
