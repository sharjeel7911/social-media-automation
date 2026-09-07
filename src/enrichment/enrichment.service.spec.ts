import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { EnrichmentService } from './enrichment.service';

describe('EnrichmentService', () => {
  it('returns null when the feature flag is off', async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        EnrichmentService,
        { provide: ConfigService, useValue: { get: () => 'false' } },
      ],
    }).compile();

    const service = moduleRef.get(EnrichmentService);
    const result = await service.enrichDomain('acme.com');
    expect(result).toBeNull();
  });
});