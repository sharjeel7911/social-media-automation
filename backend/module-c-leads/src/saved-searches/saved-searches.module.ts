import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { LeadsModule } from '../leads/leads.module';
import { PipelineModule } from '../pipeline/pipeline.module';
import { SupabaseModule } from '../supabase/supabase.module';
import { SavedSearchService } from './saved-search.service';
import { SupabaseSavedSearchesRepository } from './supabase-saved-searches.repository';

@Module({
  imports: [ScheduleModule.forRoot(), LeadsModule, PipelineModule, SupabaseModule],
  providers: [
    SavedSearchService,
    { provide: 'SavedSearchesRepository', useClass: SupabaseSavedSearchesRepository },
  ],
  exports: [SavedSearchService],
})
export class SavedSearchesModule {}