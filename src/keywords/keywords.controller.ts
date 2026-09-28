import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { KeywordsService } from './keywords.service';
import { CreateKeywordDto } from './dto/create-keyword.dto';
import { UpdateKeywordDto } from './dto/update-keyword.dto';

@Controller('keywords')
export class KeywordsController {
  constructor(private readonly keywordsService: KeywordsService) {}

  // Standalone research — doesn't save anything, just returns volume/difficulty for a term.
  // Placed before ':id' routes so 'research' isn't parsed as an id.
  @Get('research')
  research(@Query('term') term: string) {
    return this.keywordsService.research(term);
  }

  @Post()
  create(@Body() dto: CreateKeywordDto) {
    return this.keywordsService.create(dto);
  }

  @Get()
  findAll(@Query('isTracked') isTracked?: string) {
    const filter = isTracked !== undefined ? { isTracked: isTracked === 'true' } : {};
    return this.keywordsService.findAll(filter);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.keywordsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateKeywordDto) {
    return this.keywordsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.keywordsService.remove(id);
  }

  @Post(':id/check-rank')
  checkRank(@Param('id', ParseIntPipe) id: number) {
    return this.keywordsService.checkRankNow(id);
  }

  @Get(':id/rank-history')
  rankHistory(@Param('id', ParseIntPipe) id: number) {
    return this.keywordsService.getRankHistory(id);
  }
}