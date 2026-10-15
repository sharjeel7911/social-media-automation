import { Injectable } from '@nestjs/common';
import { createHash } from 'crypto';
import type { LeadRecord } from '../leads/lead-record.interface';

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Exported as a plain function too, so NormalizationService can import it
// directly without going through NestJS dependency injection.
export function buildFingerprint(input: { company: string; title: string; domain?: string }): string {
  const key = [normalizeText(input.company), normalizeText(input.title), input.domain ?? ''].join('|');
  return createHash('sha256').update(key).digest('hex');
}

export function deduplicateLeads(leads: LeadRecord[]): LeadRecord[] {
  const seen = new Map<string, LeadRecord>();

  for (const lead of leads) {
    const existing = seen.get(lead.fingerprint);
    const isNewer = !existing || new Date(lead.datePosted ?? 0) > new Date(existing.datePosted ?? 0);
    if (isNewer) {
      seen.set(lead.fingerprint, lead);
    }
  }

  return Array.from(seen.values());
}

@Injectable()
export class DeduplicationService {
  buildFingerprint(input: { company: string; title: string; domain?: string }): string {
    return buildFingerprint(input);
  }

  deduplicate(leads: LeadRecord[]): LeadRecord[] {
    return deduplicateLeads(leads);
  }
}