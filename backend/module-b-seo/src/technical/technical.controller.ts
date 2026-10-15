import { Body, Controller, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { TechnicalService } from './technical.service';
import { RunTechnicalCheckDto } from './dto/run-technical-check.dto';

@Controller('technical')
export class TechnicalController {
  constructor(private readonly technicalService: TechnicalService) {}

  @Post()
  run(@Body() dto: RunTechnicalCheckDto) {
    return this.technicalService.run(dto);
  }

  @Get()
  findAll() {
    return this.technicalService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.technicalService.findOne(id);
  }
}