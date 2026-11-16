import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { GamesModule } from './games/games.module.js';
import { GendersModule } from './genders/genders.module.js';
import { PlatformsModule } from './platforms/platforms.module.js';
import { PublishersModule } from './publishers/publishers.module.js';
import { DashboardModule } from './dashboard/dashboard.module.js';

@Module({
  imports: [GamesModule, GendersModule, PlatformsModule, PublishersModule, DashboardModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
