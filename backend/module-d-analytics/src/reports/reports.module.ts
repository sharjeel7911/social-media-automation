import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { Analytics } from '../analytics/analytics.entity';
import { PipelineLead } from '../pipeline/pipeline.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Analytics,
      PipelineLead,
    ]),
  ],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}