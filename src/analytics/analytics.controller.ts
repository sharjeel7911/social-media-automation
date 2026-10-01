import { Body, Controller, Get, Post } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { Analytics } from './analytics.entity';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Post()
  async create(@Body() data: Partial<Analytics>): Promise<Analytics> {
    return this.analyticsService.create(data);
  }

  @Get()
  async findAll(): Promise<Analytics[]> {
    return this.analyticsService.findAll();
  }
}