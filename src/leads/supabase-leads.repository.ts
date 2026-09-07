import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import type { LeadRow } from './lead-row.type';
import type { LeadsRepository } from './leads-repository.interface';

@Injectable()
export class SupabaseLeadsRepository implements LeadsRepository {
  constructor(private readonly supabaseService: SupabaseService) {}

  async findAll(): Promise<LeadRow[]> {
    const { data, error } = await this.supabaseService.client
      .from('leads')
      .select('*');
    if (error) throw error;
    return data as LeadRow[];
  }

  async findByFingerprint(deduplicationKey: string): Promise<LeadRow | null> {
    const { data, error } = await this.supabaseService.client
      .from('leads')
      .select('*')
      .eq('deduplication_key', deduplicationKey)
      .maybeSingle();
    if (error) throw error;
    return (data as LeadRow) ?? null;
  }

  async save(lead: LeadRow): Promise<LeadRow> {
    const { data, error } = await this.supabaseService.client
      .from('leads')
      .upsert(lead, { onConflict: 'deduplication_key' })
      .select()
      .single();
    if (error) throw error;
    return data as LeadRow;
  }

  async saveMany(leads: LeadRow[]): Promise<LeadRow[]> {
    const { data, error } = await this.supabaseService.client
      .from('leads')
      .upsert(leads, { onConflict: 'deduplication_key' })
      .select();
    if (error) throw error;
    return data as LeadRow[];
  }


    async findByRawJobId(rawJobId: number): Promise<LeadRow | null> {
    const { data, error } = await this.supabaseService.client
      .from('leads')
      .select('*')
      .eq('raw_job_id', rawJobId)
      .maybeSingle();
    if (error) throw error;
    return (data as LeadRow) ?? null;
  }
}