import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AggregationService } from './aggregation.service';
import { Analytics } from '../analytics/analytics.entity';
import { PipelineLead } from '../pipeline/pipeline.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Analytics, PipelineLead])],
  providers: [AggregationService],
  exports: [AggregationService],
})
export class AggregationModule {}