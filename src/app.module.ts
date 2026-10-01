import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AnalyticsModule } from './analytics/analytics.module';
import { AggregationModule } from './aggregation/aggregation.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { PipelineModule } from './pipeline/pipeline.module';
import { ReportsModule } from './reports/reports.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'better-sqlite3',
      database: 'module-d.sqlite',
      autoLoadEntities: true,
      synchronize: true,
    }),
    AnalyticsModule,
    AggregationModule,
    DashboardModule,
    PipelineModule,
    ReportsModule,
  ],
})
export class AppModule {}