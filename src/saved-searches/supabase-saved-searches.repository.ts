import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import type { SavedSearchRow } from './saved-search-row.type';
import type { SavedSearchesRepository } from './saved-searches.repository.interface';

@Injectable()
export class SupabaseSavedSearchesRepository implements SavedSearchesRepository {
  constructor(private readonly supabaseService: SupabaseService) {}

  async findActive(): Promise<SavedSearchRow[]> {
    const { data, error } = await this.supabaseService.client
      .from('saved_searches')
      .select('*')
      .eq('is_active', true);
    if (error) throw error;
    return data as SavedSearchRow[];
  }

  async updateLastRunAt(id: number, lastRunAt: string): Promise<void> {
    const { error } = await this.supabaseService.client
      .from('saved_searches')
      .update({ last_run_at: lastRunAt, updated_at: lastRunAt })
      .eq('id', id);
    if (error) throw error;
  }
}