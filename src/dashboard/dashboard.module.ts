import { Module } from '@nestjs/common';
import { OverviewModule } from './overview/overview.module.js';
import { SalesMapModule } from './sales-map/sales-map.module.js';
import { RankingsModule } from './rankings/rankings.module.js';
import { GameAnalyticsModule } from './game-analytics/game-analytics.module.js';
import { ReportsModule } from './reports/reports.module.js';
import { RouterModule } from '@nestjs/core';

@Module({
  imports: [
    OverviewModule,
    SalesMapModule,
    RankingsModule,
    GameAnalyticsModule,
    ReportsModule,
    RouterModule.register([
      {
        path: 'dashboard',
        module: DashboardModule,
        children: [
          {
            path: 'overview',
            module: OverviewModule,
          },
          {
            path: 'sales-map',
            module: SalesMapModule,
          },
          {
            path: 'rankings',
            module: RankingsModule,
          },
          {
            path: 'game-analytics',
            module: GameAnalyticsModule,
          },
          {
            path: 'reports',
            module: ReportsModule,
          },
        ],
      },
    ]),
  ],
})
export class DashboardModule {}
