import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TechnicalCheck } from './entities/technical-check.entity';
import { RunTechnicalCheckDto } from './dto/run-technical-check.dto';
import { runTechnicalCheck } from './technical-checker';

@Injectable()
export class TechnicalService {
  constructor(
    @InjectRepository(TechnicalCheck) private readonly repo: Repository<TechnicalCheck>,
  ) {}

  async run(dto: RunTechnicalCheckDto) {
    let result;
    try {
      result = await runTechnicalCheck(dto.url);
    } catch {
      throw new BadRequestException(`Could not reach ${dto.url}`);
    }

    const check = this.repo.create({
      url: dto.url,
      score: result.score,
      details: JSON.stringify(result.details),
    });

    const saved = await this.repo.save(check);
    return { ...saved, details: result.details };
  }

  async findAll() {
    const checks = await this.repo.find({ order: { createdAt: 'DESC' } });
    return checks.map((c) => ({ ...c, details: JSON.parse(c.details) }));
  }

  async findOne(id: number) {
    const check = await this.repo.findOneBy({ id });
    if (!check) throw new BadRequestException(`Technical check ${id} not found`);
    return { ...check, details: JSON.parse(check.details) };
  }
}