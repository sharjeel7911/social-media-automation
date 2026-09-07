import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LeadsController } from './leads.controller';
import { LeadsService } from './leads.service';
import { InMemoryLeadsRepository } from './in-memory-leads.repository';
import { SqliteLeadsRepository } from './sqlite-leads.repository';
import { SupabaseLeadsRepository } from './supabase-leads.repository';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
  imports: [SupabaseModule],
  controllers: [LeadsController],
  providers: [
    LeadsService,
    SqliteLeadsRepository,
    InMemoryLeadsRepository,
    SupabaseLeadsRepository,
    {
      provide: 'LeadsRepository',
      useFactory: (
        config: ConfigService,
        sqlite: SqliteLeadsRepository,
        memory: InMemoryLeadsRepository,
        supabase: SupabaseLeadsRepository,
      ) => {
        const driver = config.get<string>('DB_DRIVER') ?? 'memory';
        if (driver === 'supabase') return supabase;
        if (driver === 'sqlite') return sqlite;
        return memory;
      },
      inject: [ConfigService, SqliteLeadsRepository, InMemoryLeadsRepository, SupabaseLeadsRepository],
    },
  ],
  exports: ['LeadsRepository'],
})
export class LeadsModule {}