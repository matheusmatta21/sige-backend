import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module.js';
import { GamesModule } from './games/games.module.js';
import { GenresModule } from './genres/genres.module.js';
import { PlatformsModule } from './platforms/platforms.module.js';
import { PublishersModule } from './publishers/publishers.module.js';
import { DashboardModule } from './dashboard/dashboard.module.js';

@Module({
  imports: [
    PrismaModule,
    GamesModule,
    GenresModule,
    PlatformsModule,
    PublishersModule,
    DashboardModule,
  ],

})
export class AppModule {}
