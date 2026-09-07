import { Test } from '@nestjs/testing';
import { NormalizationService } from './normalization.service';
import type { RawJobRow } from './raw-job-row.type';

describe('NormalizationService', () => {
  let service: NormalizationService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [NormalizationService],
    }).compile();
    service = moduleRef.get(NormalizationService);
  });

  it('maps a raw job into a LeadRow', () => {
    const rawJob: RawJobRow = {
      id: 42,
      created_at: '2026-09-01T00:00:00.000Z',
      source_id: 1,
      external_job_id: 'job_123',
      raw_data: JSON.stringify({
        title: '  Virtual Receptionist  ',
        companyName: 'Acme Inc',
        companyUrl: 'https://www.acme.com',
        jobUrl: 'https://linkedin.com/jobs/view/123',
        location: 'Remote',
        datePosted: '2026-09-01T12:00:00.000Z',
      }),
      fetched_at: '2026-09-01T00:05:00.000Z',
    };

    const result = service.normalizeRawJob(rawJob);

    expect(result.raw_job_id).toBe(42);
    expect(result.source_id).toBe(1);
    expect(result.company_name).toBe('Acme Inc');
    expect(result.job_title).toBe('Virtual Receptionist');
    expect(result.company_domain).toBe('acme.com');
    expect(result.status).toBe('new');
    expect(result.deduplication_key).toHaveLength(64);
  });
});