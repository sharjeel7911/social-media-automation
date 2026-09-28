import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Keyword } from './entities/keyword.entity';
import { RankHistory } from './entities/rank-history.entity';
import { KeywordsService } from './keywords.service';
import { KeywordsController } from './keywords.controller';
import { KeywordsSchedulerService } from './keywords-scheduler.service';
import { KEYWORD_DATA_PROVIDER, MockKeywordDataProvider } from './keyword-data.provider';

@Module({
  imports: [TypeOrmModule.forFeature([Keyword, RankHistory])],
  controllers: [KeywordsController],
  providers: [
    KeywordsService,
    KeywordsSchedulerService,
    { provide: KEYWORD_DATA_PROVIDER, useClass: MockKeywordDataProvider },
  ],
  exports: [KeywordsService],
})
export class KeywordsModule {}