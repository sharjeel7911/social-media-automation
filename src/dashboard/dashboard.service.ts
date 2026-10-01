import { Injectable } from '@nestjs/common';
import { AggregationService } from '../aggregation/aggregation.service';

@Injectable()
export class DashboardService {
  constructor(
    private readonly aggregationService: AggregationService,
  ) {}

  async getDashboard() {
    return this.aggregationService.getDashboardData();
  }

  async getSummary() {
    const data = await this.aggregationService.getDashboardData();

    return {
      seoHealth: data.seoHealth,
      engagement: data.engagement,
    };
  }
}