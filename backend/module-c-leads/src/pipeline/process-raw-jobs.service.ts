import { Injectable, Inject } from '@nestjs/common';
import type { RawJobsRepository } from './raw-jobs.repository.interface';
import type { LeadsRepository } from '../leads/leads-repository.interface';
import { NormalizationService } from '../normalization/normalization.service';
import { isWithinLast48Hours } from '../saved-searches/recency-filter';

export interface ProcessRawJobsResult {
  processed: number;
  skippedAlreadyProcessed: number;
  skippedDuplicate: number;
  skippedStale: number;
  errors: number;
}

@Injectable()
export class ProcessRawJobsService {
  constructor(
    @Inject('RawJobsRepository') private readonly rawJobsRepository: RawJobsRepository,
    @Inject('LeadsRepository') private readonly leadsRepository: LeadsRepository,
    private readonly normalizationService: NormalizationService,
  ) {}

  async run(): Promise<ProcessRawJobsResult> {
    const rawJobs = await this.rawJobsRepository.findAll();

    const result: ProcessRawJobsResult = {
      processed: 0,
      skippedAlreadyProcessed: 0,
      skippedDuplicate: 0,
      skippedStale: 0,
      errors: 0,
    };

    for (const rawJob of rawJobs) {
      try {
        const alreadyProcessed = await this.leadsRepository.findByRawJobId(rawJob.id);
        if (alreadyProcessed) {
          result.skippedAlreadyProcessed++;
          continue;
        }

        const lead = this.normalizationService.normalizeRawJob(rawJob);

        if (!isWithinLast48Hours(lead.date_posted)) {
          result.skippedStale++;
          continue;
        }

        const duplicate = await this.leadsRepository.findByFingerprint(lead.deduplication_key);
        if (duplicate) {
          result.skippedDuplicate++;
          continue;
        }

        await this.leadsRepository.save(lead);
        result.processed++;
      } catch (err) {
        console.error('Failed to process raw job', rawJob.id, err);
        result.errors++;
      }
    }

    return result;
  }
}