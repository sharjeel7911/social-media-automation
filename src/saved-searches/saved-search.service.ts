import { Injectable, Inject, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import type { LeadRow } from '../leads/lead-row.type';
import type { LeadsRepository } from '../leads/leads-repository.interface';
import type { SavedSearchesRepository } from './saved-searches.repository.interface';
import { ProcessRawJobsService } from '../pipeline/process-raw-jobs.service';
import { filterRecentLeads } from './recency-filter';

@Injectable()
export class SavedSearchService {
  private readonly logger = new Logger(SavedSearchService.name);

  constructor(
    @Inject('LeadsRepository') private readonly leadsRepository: LeadsRepository,
    @Inject('SavedSearchesRepository') private readonly savedSearchesRepository: SavedSearchesRepository,
    private readonly processRawJobsService: ProcessRawJobsService,
  ) {}

  isDue(schedule: string | null, lastRunAt: string | null): boolean {
    if (!schedule) return false;
    if (!lastRunAt) return true;
    const hoursSinceLastRun = (Date.now() - new Date(lastRunAt).getTime()) / (1000 * 60 * 60);
    switch (schedule) {
      case 'hourly': return hoursSinceLastRun >= 1;
      case 'daily': return hoursSinceLastRun >= 24;
      case 'weekly': return hoursSinceLastRun >= 24 * 7;
      default: return false;
    }
  }

  @Cron(CronExpression.EVERY_HOUR)
  async checkAndRunDueSearches(): Promise<void> {
    this.logger.log('Checking for due saved searches...');
    const activeSearches = await this.savedSearchesRepository.findActive();
    const dueSearches = activeSearches.filter((s) => this.isDue(s.schedule, s.last_run_at));

    if (dueSearches.length === 0) {
      this.logger.log('No saved searches are due.');
      return;
    }

    this.logger.log(`${dueSearches.length} saved search(es) due — running pipeline.`);

    // Note: this runs the pipeline once for all due searches combined, since the
    // pipeline currently processes all unprocessed raw_jobs regardless of which
    // saved search they came from. Once Person 1's connector ties raw_jobs to
    // specific saved searches, this can be scoped per-search instead.
    const result = await this.processRawJobsService.run();
    this.logger.log(`Pipeline run result: ${JSON.stringify(result)}`);

    const now = new Date().toISOString();
    for (const search of dueSearches) {
      await this.savedSearchesRepository.updateLastRunAt(search.id, now);
    }
  }

  async runSearchAndAppendNew(
    incomingLeads: LeadRow[],
  ): Promise<{ added: LeadRow[]; skipped: number; filteredOutStale: number }> {
    const recentLeads = filterRecentLeads(incomingLeads);
    const filteredOutStale = incomingLeads.length - recentLeads.length;

    const added: LeadRow[] = [];
    let skipped = 0;

    for (const lead of recentLeads) {
      const existing = await this.leadsRepository.findByFingerprint(lead.deduplication_key);
      if (existing) {
        skipped++;
        continue;
      }
      await this.leadsRepository.save(lead);
      added.push(lead);
    }

    return { added, skipped, filteredOutStale };
  }
}