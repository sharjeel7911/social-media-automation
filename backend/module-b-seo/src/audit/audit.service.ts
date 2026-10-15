import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Audit } from './entities/audit.entity';
import { RunAuditDto } from './dto/run-audit.dto';
import { scoreHtml } from './audit-scorer';

@Injectable()
export class AuditService {
  constructor(@InjectRepository(Audit) private readonly repo: Repository<Audit>) {}

  async run(dto: RunAuditDto) {
    let html: string;

    if (dto.url) {
      html = await this.fetchHtml(dto.url);
    } else if (dto.rawContent) {
      html = dto.rawContent;
    } else {
      throw new BadRequestException('Provide either url or rawContent');
    }

    const { score, details } = scoreHtml(html, dto.targetKeyword, dto.url);

    const audit = this.repo.create({
      url: dto.url ?? null,
      rawContent: dto.url ? null : dto.rawContent, // don't duplicate storage when we fetched a URL
      targetKeyword: dto.targetKeyword ?? null,
      score,
      details: JSON.stringify(details),
    });

    const saved = await this.repo.save(audit);
    return { ...saved, details }; // return details as an object, not a JSON string
  }

  async findAll() {
    const audits = await this.repo.find({ order: { createdAt: 'DESC' } });
    return audits.map((a) => ({ ...a, details: JSON.parse(a.details) }));
  }

  async findOne(id: number) {
    const audit = await this.repo.findOneBy({ id });
    if (!audit) throw new BadRequestException(`Audit ${id} not found`);
    return { ...audit, details: JSON.parse(audit.details) };
  }

  private async fetchHtml(url: string): Promise<string> {
    let res: Response;
    try {
      res = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (SEO-Audit-Bot)' },
        signal: AbortSignal.timeout(10_000), // don't hang forever on a slow site
      });
    } catch {
      throw new BadRequestException(`Could not reach ${url}`);
    }
    if (!res.ok) {
      throw new BadRequestException(`${url} returned status ${res.status}`);
    }
    return res.text();
  }
}