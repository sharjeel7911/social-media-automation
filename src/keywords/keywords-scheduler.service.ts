import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { KeywordsService } from './keywords.service';

@Injectable()
export class KeywordsSchedulerService {
  private readonly log = new Logger(KeywordsSchedulerService.name);
  private running = false;

  constructor(private readonly keywordsService: KeywordsService) {}

  // Runs once a day. CronExpression.EVERY_DAY_AT_2AM = low-traffic time, less likely
  // to hit rate limits once a real paid provider replaces the mock.
@Cron(CronExpression.EVERY_DAY_AT_2AM)
  async runDailyRankChecks() {
    if (this.running) return; // never overlap runs, same guard as Module A's scheduler
    this.running = true;
    try {
      const tracked = await this.keywordsService.findAllTracked();
      this.log.log(`Running daily rank check for ${tracked.length} keyword(s)`);

      for (const keyword of tracked) {
        try {
          await this.keywordsService.checkRankNow(keyword.id);
        } catch (e) {
          // one keyword failing shouldn't stop the rest from being checked
          this.log.error(`Rank check failed for keyword ${keyword.id} (${keyword.term}): ${e}`);
        }
      }
    } finally {
      this.running = false;
    }
  }
}