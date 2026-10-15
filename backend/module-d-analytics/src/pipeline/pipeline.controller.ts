import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { PipelineService } from './pipeline.service';
import { PipelineLead } from './pipeline.entity';

@Controller('pipeline')
export class PipelineController {
  constructor(
    private readonly pipelineService: PipelineService,
  ) {}

  @Post()
  async create(@Body() data: Partial<PipelineLead>) {
    return this.pipelineService.create(data);
  }

  @Get()
  async findAll(
    @Query('status') status?: string,
    @Query('withinHours') withinHours?: string,
  ) {
    const hours = withinHours
      ? Number(withinHours)
      : undefined;

    return this.pipelineService.findByStatus(
      status,
      hours && !Number.isNaN(hours) ? hours : undefined,
    );
  }

  @Get('recent')
  async getRecent(
    @Query('hours') hours?: string,
  ) {
    const parsedHours = hours
      ? Number(hours)
      : 48;

    return this.pipelineService.findRecent(
      !Number.isNaN(parsedHours)
        ? parsedHours
        : 48,
    );
  }

  @Get('kanban')
  async getKanban(
    @Query('withinHours') withinHours?: string,
  ) {
    const hours = withinHours
      ? Number(withinHours)
      : undefined;

    return this.pipelineService.getKanban(
      hours && !Number.isNaN(hours)
        ? hours
        : undefined,
    );
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() data: Partial<PipelineLead>,
  ) {
    return this.pipelineService.update(
      Number(id),
      data,
    );
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.pipelineService.remove(Number(id));

    return {
      message: 'LinkedIn lead deleted successfully',
    };
  }
}