import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

export interface RankHistoryRow {
  id: number;
  keywordId: number;
  rank: number | null;
  checkedAt: string;
}

export interface AuditRow {
  id: number;
  url: string;
  targetKeyword: string;
  score: number;
  createdAt: string;
}

export interface TechnicalCheckRow {
  id: number;
  url: string;
  score: number;
  createdAt: string;
}

@Injectable()
export class ReportsService {
  constructor(private readonly dataSource: DataSource) {}

  async getWeeklyReport() {
    const since = new Date();
    since.setDate(since.getDate() - 7);

    const keywords = await this.dataSource.query(
      `SELECT id, term, "targetUrl", "searchVolume", difficulty, "currentRank", "isTracked", "createdAt"
       FROM keyword
       WHERE "isTracked" = 1`,
    );

    const rankHistory: RankHistoryRow[] = await this.dataSource.query(
      `SELECT id, "keywordId", rank, "checkedAt"
       FROM rank_history
       WHERE "checkedAt" >= ?
       ORDER BY "checkedAt" DESC`,
      [since.toISOString()],
    );

    const audits: AuditRow[] = await this.dataSource.query(
      `SELECT id, url, "targetKeyword", score, "createdAt"
       FROM audit
       WHERE "createdAt" >= ?
       ORDER BY "createdAt" DESC`,
      [since.toISOString()],
    );

    const technicalChecks: TechnicalCheckRow[] =
      await this.dataSource.query(
        `SELECT id, url, score, "createdAt"
         FROM technical_check
         WHERE "createdAt" >= ?
         ORDER BY "createdAt" DESC`,
        [since.toISOString()],
      );

    const validRanks = rankHistory
      .map((item: RankHistoryRow) => item.rank)
      .filter((rank: number | null): rank is number => rank !== null);

    const averageRank =
      validRanks.length > 0
        ? Number(
            (
              validRanks.reduce(
                (sum: number, rank: number) => sum + rank,
                0,
              ) / validRanks.length
            ).toFixed(2),
          )
        : null;

    const averageAuditScore =
      audits.length > 0
        ? Number(
            (
              audits.reduce(
                (sum: number, audit: AuditRow) => sum + audit.score,
                0,
              ) / audits.length
            ).toFixed(2),
          )
        : null;

    const averageTechnicalScore =
      technicalChecks.length > 0
        ? Number(
            (
              technicalChecks.reduce(
                (sum: number, check: TechnicalCheckRow) =>
                  sum + check.score,
                0,
              ) / technicalChecks.length
            ).toFixed(2),
          )
        : null;

    return {
      period: {
        from: since.toISOString(),
        to: new Date().toISOString(),
      },

      summary: {
        trackedKeywords: keywords.length,
        rankChecks: rankHistory.length,
        averageRank,
        auditsCompleted: audits.length,
        averageAuditScore,
        technicalChecksCompleted: technicalChecks.length,
        averageTechnicalScore,
      },

      keywords,
      rankHistory,
      audits,
      technicalChecks,
    };
  }
}