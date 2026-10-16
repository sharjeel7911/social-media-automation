// ============================================================================
// WHAT IS THIS FILE?
// Aggregation APIs — per TASKS.md Module D "Aggregation APIs: Pull data
// from Modules A, B, and C (posts, leads, SEO data)".
//
// Since Module D owns its own SQLite for Analytics and the Pipeline, those
// are queried directly. Data from Modules A (posts) and B (SEO) would
// require either a shared DB or an inter-service HTTP call. Those are
// currently placeholder stubs — see the comments on each method for where
// the real wiring goes once the team aligns on a data-sharing strategy
// (as noted in modules/dashboard/services/dataSync.ts on the frontend).
// ============================================================================

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Analytics } from '../analytics/analytics.entity';
import { PipelineLead } from '../pipeline/pipeline.entity';

@Injectable()
export class AggregationService {
  constructor(
    @InjectRepository(Analytics)
    private readonly analyticsRepo: Repository<Analytics>,

    @InjectRepository(PipelineLead)
    private readonly pipelineRepo: Repository<PipelineLead>,
  ) {}

  // -------------------------------------------------------------------------
  // Full dashboard aggregate — home screen KPIs in a single call.
  // -------------------------------------------------------------------------
  async getDashboardData() {
    const [seoHealth, engagement, latestLeads] = await Promise.all([
      this.getSeoHealth(),
      this.getEngagement(),
      this.getLatestLeads(),
    ]);

    return {
      // Stub: real scheduled posts come from Module A's SQLite/API.
      scheduledPosts: [],
      latestLeads,
      seoHealth,
      engagement,
    };
  }

  // -------------------------------------------------------------------------
  // Scheduled posts — stub until Module A exposes an API / shared DB.
  // -------------------------------------------------------------------------
  async getScheduledPosts() {
    // TODO: query Module A's posts endpoint or shared DB when available.
    return [];
  }

  // -------------------------------------------------------------------------
  // Latest leads — last 5 leads ordered by creation time (real DB query).
  // -------------------------------------------------------------------------
  async getLatestLeads() {
    const leads = await this.pipelineRepo.find({
      where: { platform: 'linkedin' },
      order: { createdAt: 'DESC' },
      take: 5,
    });

    return leads.map((l) => ({
      id: l.id,
      name: l.name,
      company: l.company,
      status: l.status,
      createdAt: l.createdAt,
    }));
  }

  // -------------------------------------------------------------------------
  // SEO health snapshot — stub until Module B exposes an API / shared DB.
  // -------------------------------------------------------------------------
  async getSeoHealth() {
    // TODO: call Module B's REST API (e.g. GET http://localhost:3001/reports/weekly)
    // or read from a shared SQLite once the team picks a strategy.
    return {
      averageAuditScore: null as number | null,
      technicalScore: null as number | null,
      trackedKeywords: 0,
    };
  }

  // -------------------------------------------------------------------------
  // Engagement summary — 30-day rollup from the local Analytics table.
  // -------------------------------------------------------------------------
  async getEngagement() {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 30);

    const records = await this.analyticsRepo
      .createQueryBuilder('a')
      .where('a.platform = :platform', { platform: 'linkedin' })
      .andWhere('a.recordedAt >= :cutoff', { cutoff })
      .orderBy('a.recordedAt', 'ASC')
      .getMany();

    if (records.length === 0) {
      return { impressions: 0, engagementRate: 0, followerGrowth: 0 };
    }

    const totalImpressions = records.reduce((s, r) => s + r.impressions, 0);
    const avgEngagement =
      records.reduce((s, r) => s + r.engagementRate, 0) / records.length;
    const followerGrowth =
      (records[records.length - 1].followers ?? 0) -
      (records[0].followers ?? 0);

    return {
      impressions: totalImpressions,
      engagementRate: Number(avgEngagement.toFixed(2)),
      followerGrowth,
    };
  }

  // -------------------------------------------------------------------------
  // Pipeline stage breakdown — counts per status (real DB query).
  // -------------------------------------------------------------------------
  async getPipelineBreakdown() {
    const statuses = ['New', 'Contacted', 'Replied', 'Qualified', 'Won', 'Lost'];
    const counts = await Promise.all(
      statuses.map(async (status) => {
        const count = await this.pipelineRepo.count({
          where: { platform: 'linkedin', status },
        });
        return { status, count };
      }),
    );

    return counts.reduce(
      (acc, { status, count }) => {
        acc[status] = count;
        return acc;
      },
      {} as Record<string, number>,
    );
  }
}