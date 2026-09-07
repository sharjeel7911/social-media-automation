import { Controller, Get } from '@nestjs/common';
import { ProcessRawJobsService } from './process-raw-jobs.service';

@Controller('pipeline')
export class PipelineController {
  constructor(private readonly processRawJobsService: ProcessRawJobsService) {}

  @Get('run')
  async run() {
    return this.processRawJobsService.run();
  }
}
