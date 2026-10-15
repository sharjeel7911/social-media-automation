import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Analytics } from './analytics.entity';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Analytics)
    private readonly analyticsRepository: Repository<Analytics>,
  ) {}

  async create(data: Partial<Analytics>): Promise<Analytics> {
    
const analytics = this.analyticsRepository.create({
  ...data,
  platform: 'linkedin',
});
    analytics.engagementRate = this.calculateEngagementRate(
      analytics.impressions,
      analytics.likes,
      analytics.comments,
      analytics.shares,
      analytics.clicks,
    );

    return this.analyticsRepository.save(analytics);
  }

  async findAll(): Promise<Analytics[]> {
    return this.analyticsRepository.find({
      order: {
        recordedAt: 'DESC',
      },
    });
  }

  async getGrowth(platform?: string) {
    const query = this.analyticsRepository
      .createQueryBuilder('analytics')
      .orderBy('analytics.recordedAt', 'ASC');

    if (platform) {
      query.where('analytics.platform = :platform', { platform });
    }

    const records = await query.getMany();

    if (records.length === 0) {
      return {
        platform: platform ?? 'all',
        followerGrowth: 0,
        records: [],
      };
    }

    const firstFollowers = records[0].followers ?? 0;
    const lastFollowers = records[records.length - 1].followers ?? 0;

    return {
      platform: platform ?? 'all',
      startingFollowers: firstFollowers,
      currentFollowers: lastFollowers,
      followerGrowth: lastFollowers - firstFollowers,
      growthPercentage:
        firstFollowers === 0
          ? 0
          : Number(
              (((lastFollowers - firstFollowers) / firstFollowers) * 100).toFixed(
                2,
              ),
            ),
      records: records.map((record) => ({
        recordedAt: record.recordedAt,
        followers: record.followers,
      })),
    };
  }

  async getTopPosts(limit = 10, platform?: string) {
    const query = this.analyticsRepository
      .createQueryBuilder('analytics')
      .where('analytics.postId IS NOT NULL')
      .orderBy('analytics.engagementRate', 'DESC')
      .take(limit);

    if (platform) {
      query.andWhere('analytics.platform = :platform', { platform });
    }

    const records = await query.getMany();

    return records.map((record) => ({
      postId: record.postId,
      platform: record.platform,
      impressions: record.impressions,
      likes: record.likes,
      comments: record.comments,
      shares: record.shares,
      clicks: record.clicks,
      engagementRate: record.engagementRate,
      recordedAt: record.recordedAt,
    }));
  }

  private calculateEngagementRate(
    impressions = 0,
    likes = 0,
    comments = 0,
    shares = 0,
    clicks = 0,
  ): number {
    if (impressions === 0) {
      return 0;
    }

    const engagements = likes + comments + shares + clicks;

    return Number(((engagements / impressions) * 100).toFixed(2));
  }
}