import { Body, Controller, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { AuditService } from './audit.service';
import { RunAuditDto } from './dto/run-audit.dto';

@Controller('audit')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Post()
  run(@Body() dto: RunAuditDto) {
    return this.auditService.run(dto);
  }

  @Get()
  findAll() {
    return this.auditService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.auditService.findOne(id);
  }
}