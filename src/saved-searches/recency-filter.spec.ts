import { isWithinLast48Hours, filterRecentLeads } from './recency-filter';
import type { LeadRow } from '../leads/lead-row.type';

describe('isWithinLast48Hours', () => {
  const now = new Date('2026-09-04T12:00:00.000Z');

  it('accepts a lead posted 1 hour ago', () => {
    expect(isWithinLast48Hours('2026-09-04T11:00:00.000Z', now)).toBe(true);
  });

  it('accepts a lead posted exactly 48 hours ago', () => {
    expect(isWithinLast48Hours('2026-09-02T12:00:00.000Z', now)).toBe(true);
  });

  it('rejects a lead posted 49 hours ago', () => {
    expect(isWithinLast48Hours('2026-09-02T11:00:00.000Z', now)).toBe(false);
  });

  it('rejects a lead with no date_posted', () => {
    expect(isWithinLast48Hours(null, now)).toBe(false);
    expect(isWithinLast48Hours(undefined, now)).toBe(false);
  });
});

function makeLead(overrides: Partial<LeadRow> = {}): LeadRow {
  return {
    raw_job_id: 1,
    source_id: 1,
    external_job_id: 'ext-1',
    company_name: 'Acme',
    company_domain: null,
    job_title: 'Virtual Receptionist',
    job_url: 'https://linkedin.com/jobs/1',
    location: null,
    date_posted: null,
    description: null,
    industry: null,
    remote_only: null,
    employment_type: null,
    deduplication_key: 'fp-1',
    status: 'new',
    ...overrides,
  };
}

describe('filterRecentLeads', () => {
  it('keeps only leads within the window', () => {
    const now = new Date('2026-09-04T12:00:00.000Z');
    const leads = [
      makeLead({ deduplication_key: '1', date_posted: '2026-09-04T10:00:00.000Z' }),
      makeLead({ deduplication_key: '2', date_posted: '2026-08-01T00:00:00.000Z' }),
    ];
    const result = filterRecentLeads(leads, now);
    expect(result.map((l) => l.deduplication_key)).toEqual(['1']);
  });
});