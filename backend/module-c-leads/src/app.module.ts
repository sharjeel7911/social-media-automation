import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SupabaseModule } from './supabase/supabase.module';
import { LeadsModule } from './leads/leads.module';
import { SavedSearchesModule } from './saved-searches/saved-searches.module';
import { NormalizationModule } from './normalization/normalization.module';
import { DeduplicationModule } from './deduplication/deduplication.module';
import { EnrichmentModule } from './enrichment/enrichment.module';
import { PipelineModule } from './pipeline/pipeline.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    SupabaseModule,
    LeadsModule,
    SavedSearchesModule,
    NormalizationModule,
    DeduplicationModule,
    EnrichmentModule,
    PipelineModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}