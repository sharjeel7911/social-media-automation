import { Module } from '@nestjs/common';
import { LeadsModule } from '../leads/leads.module';
import { NormalizationModule } from '../normalization/normalization.module';
import { SupabaseModule } from '../supabase/supabase.module';
import { SupabaseRawJobsRepository } from './supabase-raw-jobs.repository';
import { ProcessRawJobsService } from './process-raw-jobs.service';
import { PipelineController } from './pipeline.controller';

@Module({
  imports: [LeadsModule, NormalizationModule, SupabaseModule],
  controllers: [PipelineController],
  providers: [
    { provide: 'RawJobsRepository', useClass: SupabaseRawJobsRepository },
    ProcessRawJobsService,
  ],
  exports: [ProcessRawJobsService],
})
export class PipelineModule {}