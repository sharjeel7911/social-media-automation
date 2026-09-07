import { Injectable } from '@nestjs/common';
import type { LeadRow } from './lead-row.type';
import type { LeadsRepository } from './leads-repository.interface';

@Injectable()
export class InMemoryLeadsRepository implements LeadsRepository {
  private leads = new Map<string, LeadRow>();

  async findAll(): Promise<LeadRow[]> {
    return Array.from(this.leads.values());
  }

  async findByFingerprint(deduplicationKey: string): Promise<LeadRow | null> {
    return this.leads.get(deduplicationKey) ?? null;
  }

  async save(lead: LeadRow): Promise<LeadRow> {
    this.leads.set(lead.deduplication_key, lead);
    return lead;
  }

  async saveMany(leads: LeadRow[]): Promise<LeadRow[]> {
    for (const lead of leads) {
      this.leads.set(lead.deduplication_key, lead);
    }
    return leads;
  }

    async findByRawJobId(rawJobId: number): Promise<LeadRow | null> {
    return Array.from(this.leads.values()).find((l) => l.raw_job_id === rawJobId) ?? null;
  }
}