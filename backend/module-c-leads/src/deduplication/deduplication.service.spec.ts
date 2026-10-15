import { Test } from '@nestjs/testing';
import { DeduplicationService } from './deduplication.service';
import type { LeadRecord } from '../leads/lead-record.interface';

function makeLead(overrides: Partial<LeadRecord> = {}): LeadRecord {
  return {
    id: '1',
    company: 'Acme Inc',
    title: 'Virtual Receptionist',
    link: 'https://linkedin.com/jobs/1',
    source: 'linkedin',
    fingerprint: 'abc123',
    firstSeenAt: '2026-09-01T00:00:00.000Z',
    lastSeenAt: '2026-09-01T00:00:00.000Z',
    datePosted: '2026-09-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('DeduplicationService', () => {
  let service: DeduplicationService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [DeduplicationService],
    }).compile();
    service = moduleRef.get(DeduplicationService);
  });

  it('collapses leads with the same fingerprint, keeping the newer one', () => {
    const leads = [
      makeLead({ id: '1', datePosted: '2026-09-01T00:00:00.000Z' }),
      makeLead({ id: '2', datePosted: '2026-09-03T00:00:00.000Z' }),
    ];
    const result = service.deduplicate(leads);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('2');
  });

  it('keeps leads with different fingerprints', () => {
    const leads = [makeLead({ fingerprint: 'a' }), makeLead({ fingerprint: 'b' })];
    expect(service.deduplicate(leads)).toHaveLength(2);
  });
});