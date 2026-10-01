import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Analytics } from '../analytics/analytics.entity';
import { PipelineLead } from '../pipeline/pipeline.entity';
import { Parser } from 'json2csv';
import PDFDocument from 'pdfkit';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Analytics)
    private readonly analyticsRepository: Repository<Analytics>,

    @InjectRepository(PipelineLead)
    private readonly pipelineRepository: Repository<PipelineLead>,
  ) {}

  async getReport(
    period: 'weekly' | 'monthly',
  ) {
    const days = period === 'weekly' ? 7 : 30;

    const startDate = new Date();
    startDate.setDate(
      startDate.getDate() - days,
    );

    const leadStartDate = new Date();
    leadStartDate.setHours(
      leadStartDate.getHours() - 48,
    );

    const endDate = new Date();

    const analytics =
      await this.analyticsRepository
        .createQueryBuilder('analytics')
        .where(
          'analytics.platform = :platform',
          {
            platform: 'linkedin',
          },
        )
        .andWhere(
          'analytics.recordedAt >= :startDate',
          {
            startDate,
          },
        )
        .orderBy(
          'analytics.recordedAt',
          'DESC',
        )
        .getMany();

    const leads =
      await this.pipelineRepository
        .createQueryBuilder('lead')
        .where(
          'lead.platform = :platform',
          {
            platform: 'linkedin',
          },
        )
        .andWhere(
          'lead.createdAt >= :leadStartDate',
          {
            leadStartDate,
          },
        )
        .orderBy(
          'lead.createdAt',
          'DESC',
        )
        .getMany();

    const impressions =
      analytics.reduce(
        (total, item) =>
          total + item.impressions,
        0,
      );

    const likes =
      analytics.reduce(
        (total, item) =>
          total + item.likes,
        0,
      );

    const comments =
      analytics.reduce(
        (total, item) =>
          total + item.comments,
        0,
      );

    const shares =
      analytics.reduce(
        (total, item) =>
          total + item.shares,
        0,
      );

    const clicks =
      analytics.reduce(
        (total, item) =>
          total + item.clicks,
        0,
      );

    const startingFollowers =
      analytics.length
        ? analytics[
            analytics.length - 1
          ].followers
        : 0;

    const currentFollowers =
      analytics.length
        ? analytics[0].followers
        : 0;

    const followerGrowth =
      currentFollowers -
      startingFollowers;

    const engagementRate =
      impressions === 0
        ? 0
        : Number(
            (
              (
                (
                  likes +
                  comments +
                  shares +
                  clicks
                ) /
                impressions
              ) *
              100
            ).toFixed(2),
          );

    const leadsByStatus =
      leads.reduce(
        (result, lead) => {
          result[lead.status] =
            (result[lead.status] || 0) + 1;

          return result;
        },
        {} as Record<string, number>,
      );

    return {
      platform: 'linkedin',
      period,
      startDate,
      endDate,

      leadCriteria: 'last_48_hours',

      analytics: {
        records: analytics.length,
        impressions,
        likes,
        comments,
        shares,
        clicks,
        engagementRate,
        startingFollowers,
        currentFollowers,
        followerGrowth,
      },

      leads: {
        total: leads.length,
        byStatus: leadsByStatus,
      },
    };
  }

  async getCsv(
    period: 'weekly' | 'monthly',
  ): Promise<string> {
    const report =
      await this.getReport(period);

    const parser = new Parser();

    return parser.parse([
      {
        platform: report.platform,
        period: report.period,
        startDate: report.startDate,
        endDate: report.endDate,
        leadCriteria: report.leadCriteria,

        analyticsRecords:
          report.analytics.records,

        impressions:
          report.analytics.impressions,

        likes:
          report.analytics.likes,

        comments:
          report.analytics.comments,

        shares:
          report.analytics.shares,

        clicks:
          report.analytics.clicks,

        engagementRate:
          report.analytics.engagementRate,

        startingFollowers:
          report.analytics.startingFollowers,

        currentFollowers:
          report.analytics.currentFollowers,

        followerGrowth:
          report.analytics.followerGrowth,

        totalLeads:
          report.leads.total,

        newLeads:
          report.leads.byStatus.New || 0,

        contactedLeads:
          report.leads.byStatus.Contacted || 0,

        repliedLeads:
          report.leads.byStatus.Replied || 0,

        qualifiedLeads:
          report.leads.byStatus.Qualified || 0,

        wonLeads:
          report.leads.byStatus.Won || 0,

        lostLeads:
          report.leads.byStatus.Lost || 0,
      },
    ]);
  }

  async getPdf(
    period: 'weekly' | 'monthly',
  ): Promise<Buffer> {
    const report =
      await this.getReport(period);

    return new Promise(
      (resolve, reject) => {
        const doc = new PDFDocument();
        const chunks: Buffer[] = [];

        doc.on(
          'data',
          (chunk) => chunks.push(chunk),
        );

        doc.on('end', () => {
          resolve(
            Buffer.concat(chunks),
          );
        });

        doc.on('error', reject);

        doc
          .fontSize(20)
          .text(
            `LinkedIn ${
              period === 'weekly'
                ? 'Weekly'
                : 'Monthly'
            } Marketing Report`,
          );

        doc.moveDown();

        doc
          .fontSize(12)
          .text(
            `Period: ${report.startDate.toISOString()} - ${report.endDate.toISOString()}`,
          );

        doc.text(
          'Lead Criteria: Last 48 Hours',
        );

        doc.moveDown();

        doc
          .fontSize(16)
          .text('LinkedIn Analytics');

        doc.moveDown();

        doc
          .fontSize(12)
          .text(
            `Impressions: ${report.analytics.impressions}`,
          );

        doc.text(
          `Likes: ${report.analytics.likes}`,
        );

        doc.text(
          `Comments: ${report.analytics.comments}`,
        );

        doc.text(
          `Shares: ${report.analytics.shares}`,
        );

        doc.text(
          `Clicks: ${report.analytics.clicks}`,
        );

        doc.text(
          `Engagement Rate: ${report.analytics.engagementRate}%`,
        );

        doc.text(
          `Starting Followers: ${report.analytics.startingFollowers}`,
        );

        doc.text(
          `Current Followers: ${report.analytics.currentFollowers}`,
        );

        doc.text(
          `Follower Growth: ${report.analytics.followerGrowth}`,
        );

        doc.moveDown();

        doc
          .fontSize(16)
          .text('LinkedIn Lead Pipeline');

        doc.moveDown();

        doc
          .fontSize(12)
          .text(
            `Total Leads (Last 48 Hours): ${report.leads.total}`,
          );

        for (const [
          status,
          count,
        ] of Object.entries(
          report.leads.byStatus,
        )) {
          doc.text(
            `${status}: ${count}`,
          );
        }

        doc.end();
      },
    );
  }
}