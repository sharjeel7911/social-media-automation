import {
  Controller,
  Get,
  Query,
  Res,
} from '@nestjs/common';

import type { Response } from 'express';

import { ReportsService } from './reports.service';

@Controller('reports')
export class ReportsController {
  constructor(
    private readonly reportsService: ReportsService,
  ) {}

  @Get()
  async getReport(
    @Query('period')
    period: 'weekly' | 'monthly' = 'weekly',
  ) {
    return this.reportsService.getReport(period);
  }

  @Get('csv')
  async getCsv(
    @Query('period')
    period: 'weekly' | 'monthly' = 'weekly',
    @Res() res: Response,
  ) {
    const csv =
      await this.reportsService.getCsv(period);

    res.setHeader(
      'Content-Type',
      'text/csv',
    );

    res.setHeader(
      'Content-Disposition',
      `attachment; filename=linkedin-${period}-report.csv`,
    );

    res.send(csv);
  }

  @Get('pdf')
  async getPdf(
    @Query('period')
    period: 'weekly' | 'monthly' = 'weekly',
    @Res() res: Response,
  ) {
    const pdf =
      await this.reportsService.getPdf(period);

    res.setHeader(
      'Content-Type',
      'application/pdf',
    );

    res.setHeader(
      'Content-Disposition',
      `attachment; filename=linkedin-${period}-report.pdf`,
    );

    res.send(pdf);
  }
}