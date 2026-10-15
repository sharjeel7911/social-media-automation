import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TechnicalCheck } from './entities/technical-check.entity';
import { TechnicalService } from './technical.service';
import { TechnicalController } from './technical.controller';

@Module({
  imports: [TypeOrmModule.forFeature([TechnicalCheck])],
  controllers: [TechnicalController],
  providers: [TechnicalService],
  exports: [TechnicalService],
})
export class TechnicalModule {}