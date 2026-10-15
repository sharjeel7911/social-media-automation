import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import type { RawJobRow } from '../normalization/raw-job-row.type';
import type { RawJobsRepository } from './raw-jobs.repository.interface';

@Injectable()
export class SupabaseRawJobsRepository implements RawJobsRepository {
  constructor(private readonly supabaseService: SupabaseService) {}

  async findAll(): Promise<RawJobRow[]> {
    const { data, error } = await this.supabaseService.client
      .from('raw_jobs')
      .select('*');
    if (error) throw error;
    return data as RawJobRow[];
  }
}