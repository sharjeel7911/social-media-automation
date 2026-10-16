// ============================================================================
// WHAT IS THIS FILE?
// Automated report generation scheduler — per TASKS.md Module D
// "Scheduling: Automated report generation".
//
// Runs on two cron schedules (mirroring Module B's scheduler pattern):
//   • Weekly  — every Monday at 06:00 (low-traffic time)
//   • Monthly — 1st of every month at 06:00
//
// Both jobs call ReportsService.getReport() (which queries the live DB),
// log the summary to the NestJS logger, and can be extended to write to a
// file, send an email, or push data to a dashboard endpoint.
// ============================================================================

import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ReportsService } from './reports.service';

@Injectable()
export class ReportsSchedulerService {
  private readonly log = new Logger(ReportsSchedulerService.name);

  // Guard flag — prevents a second overlapping run if the job takes longer
  // than its cadence (same pattern used by Module B's keywords scheduler).
  private running = false;

  constructor(private readonly reportsService: ReportsService) {}

  // -------------------------------------------------------------------------
  // Weekly: every Monday at 06:00
  // -------------------------------------------------------------------------
  @Cron('0 6 * * 1')
  async generateWeeklyReport() {
    if (this.running) {
      this.log.warn('Report scheduler already running — skipping overlap.');
      return;
    }
    this.running = true;
    try {
      this.log.log('Generating weekly analytics report…');
      const report = await this.reportsService.getReport('weekly');

      this.log.log(
        `Weekly report done — period: ${report.startDate.toISOString().slice(0, 10)} → ${report.endDate.toISOString().slice(0, 10)} | ` +
          `impressions: ${report.analytics.impressions} | ` +
          `engagement: ${report.analytics.engagementRate}% | ` +
          `leads: ${report.leads.total}`,
      );
    } catch (err) {
      this.log.error(`Weekly report generation failed: ${err}`);
    } finally {
      this.running = false;
    }
  }

  // -------------------------------------------------------------------------
  // Monthly: 1st of every month at 06:00
  // -------------------------------------------------------------------------
  @Cron('0 6 1 * *')
  async generateMonthlyReport() {
    if (this.running) {
      this.log.warn('Report scheduler already running — skipping overlap.');
      return;
    }
    this.running = true;
    try {
      this.log.log('Generating monthly analytics report…');
      const report = await this.reportsService.getReport('monthly');

      this.log.log(
        `Monthly report done — period: ${report.startDate.toISOString().slice(0, 10)} → ${report.endDate.toISOString().slice(0, 10)} | ` +
          `impressions: ${report.analytics.impressions} | ` +
          `engagement: ${report.analytics.engagementRate}% | ` +
          `leads: ${report.leads.total}`,
      );
    } catch (err) {
      this.log.error(`Monthly report generation failed: ${err}`);
    } finally {
      this.running = false;
    }
  }
}
