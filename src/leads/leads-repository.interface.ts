
import type { LeadRow } from './lead-row.type';

export interface LeadsRepository {
  findAll(): Promise<LeadRow[]>;
  findByFingerprint(deduplicationKey: string): Promise<LeadRow | null>;
  findByRawJobId(rawJobId: number): Promise<LeadRow | null>;
  save(lead: LeadRow): Promise<LeadRow>;
  saveMany(leads: LeadRow[]): Promise<LeadRow[]>;
}