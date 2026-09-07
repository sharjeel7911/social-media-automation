import { Module } from '@nestjs/common';
import { DeduplicationService } from './deduplication.service';

@Module({
  providers: [DeduplicationService]
})
export class DeduplicationModule {}
