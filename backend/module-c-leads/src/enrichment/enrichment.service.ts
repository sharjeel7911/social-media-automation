import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { EnrichmentResult } from './enrichment.types';

@Injectable()
export class EnrichmentService {
  constructor(private readonly configService: ConfigService) {}

  private isEnabled(): boolean {
    return this.configService.get<string>('ENRICHMENT_ENABLED') === 'true';
  }

  async enrichDomain(domain: string): Promise<EnrichmentResult | null> {
    if (!this.isEnabled()) {
      return null; // feature flag off — no-op, never blocks the core pipeline
    }

    const apiKey = this.configService.get<string>('HUNTER_API_KEY');
    if (!apiKey) {
      console.warn('Enrichment enabled but HUNTER_API_KEY missing — skipping.');
      return null;
    }

    // Tomorrow: real Hunter.io call goes here, e.g.
    // const response = await fetch(`https://api.hunter.io/v2/domain-search?domain=${domain}&api_key=${apiKey}`);
    // const data = await response.json();
    // return { domain, contactEmail: data.data?.emails?.[0]?.value, source: 'hunter' };

    return null;
  }
}
