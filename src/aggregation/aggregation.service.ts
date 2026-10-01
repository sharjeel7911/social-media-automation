import { Injectable } from '@nestjs/common';

@Injectable()
export class AggregationService {
  async getDashboardData() {
    return {
      scheduledPosts: [],
      latestLeads: [],
      seoHealth: {
        averageAuditScore: 0,
        technicalScore: 0,
        trackedKeywords: 0,
      },
      engagement: {
        impressions: 0,
        engagementRate: 0,
        followerGrowth: 0,
      },
    };
  }

  async getScheduledPosts() {
    return [];
  }

  async getLatestLeads() {
    return [];
  }

  async getSeoHealth() {
    return {
      averageAuditScore: 0,
      technicalScore: 0,
      trackedKeywords: 0,
    };
  }

  async getEngagement() {
    return {
      impressions: 0,
      engagementRate: 0,
      followerGrowth: 0,
    };
  }
}