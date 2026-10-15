import { Injectable } from '@nestjs/common';
import type { LeadRow } from '../leads/lead-row.type';
import type { RawJobRow } from './raw-job-row.type';
import { buildFingerprint } from '../deduplication/deduplication.service';

function extractDomain(url?: string): string | undefined {
  if (!url) return undefined;
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return undefined;
  }
}

@Injectable()
export class NormalizationService {
  normalizeRawJob(rawJob: RawJobRow): LeadRow {
    const parsed = JSON.parse(rawJob.raw_data); 

    const company = (parsed.companyName ?? parsed.company_name ?? 'Unknown').trim();
    const title = (parsed.title ?? parsed.job_title ?? 'Unknown').trim();
    const jobUrl = parsed.jobUrl ?? parsed.job_url;
    const domain = parsed.companyDomain ?? extractDomain(parsed.companyUrl ?? jobUrl);

    return {
      raw_job_id: rawJob.id,
      source_id: rawJob.source_id,
      external_job_id: rawJob.external_job_id,
      company_name: company,
      company_domain: domain ?? null,
      job_title: title,
      job_url: jobUrl,
      location: parsed.location ?? null,
      date_posted: parsed.datePosted ? new Date(parsed.datePosted).toISOString() : null,
      description: parsed.description ?? null,
      industry: parsed.industry ?? null,
      remote_only: parsed.remoteOnly ?? null,
      employment_type: parsed.employmentType ?? null,
      deduplication_key: buildFingerprint({ company, title, domain }),
      status: 'new',
    };
  }
}