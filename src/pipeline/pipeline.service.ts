import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PipelineLead } from './pipeline.entity';

@Injectable()
export class PipelineService {
  constructor(
    @InjectRepository(PipelineLead)
    private readonly pipelineRepository: Repository<PipelineLead>,
  ) {}

  async create(
    data: Partial<PipelineLead>,
  ): Promise<PipelineLead> {
    const lead = this.pipelineRepository.create({
      ...data,
      platform: 'linkedin',
    });

    return this.pipelineRepository.save(lead);
  }

  async findAll(): Promise<PipelineLead[]> {
    return this.pipelineRepository.find({
      where: {
        platform: 'linkedin',
      },
      order: {
        updatedAt: 'DESC',
      },
    });
  }

  async findRecent(hours = 48): Promise<PipelineLead[]> {
    const cutoff = new Date(
      Date.now() - hours * 60 * 60 * 1000,
    );

    return this.pipelineRepository
      .createQueryBuilder('lead')
      .where('lead.platform = :platform', {
        platform: 'linkedin',
      })
      .andWhere('lead.createdAt >= :cutoff', {
        cutoff,
      })
      .orderBy('lead.createdAt', 'DESC')
      .getMany();
  }

  async findByStatus(
    status?: string,
    withinHours?: number,
  ): Promise<PipelineLead[]> {
    if (withinHours !== undefined) {
      const cutoff = new Date(
        Date.now() - withinHours * 60 * 60 * 1000,
      );

      const query = this.pipelineRepository
        .createQueryBuilder('lead')
        .where('lead.platform = :platform', {
          platform: 'linkedin',
        })
        .andWhere('lead.createdAt >= :cutoff', {
          cutoff,
        });

      if (status) {
        query.andWhere('lead.status = :status', {
          status,
        });
      }

      return query
        .orderBy('lead.createdAt', 'DESC')
        .getMany();
    }

    if (!status) {
      return this.findAll();
    }

    return this.pipelineRepository.find({
      where: {
        platform: 'linkedin',
        status,
      },
      order: {
        updatedAt: 'DESC',
      },
    });
  }

  async update(
    id: number,
    data: Partial<PipelineLead>,
  ): Promise<PipelineLead> {
    const lead = await this.pipelineRepository.findOne({
      where: {
        id,
        platform: 'linkedin',
      },
    });

    if (!lead) {
      throw new NotFoundException('LinkedIn lead not found');
    }

    Object.assign(lead, data);
    lead.platform = 'linkedin';

    return this.pipelineRepository.save(lead);
  }

  async remove(id: number): Promise<void> {
    const lead = await this.pipelineRepository.findOne({
      where: {
        id,
        platform: 'linkedin',
      },
    });

    if (!lead) {
      throw new NotFoundException('LinkedIn lead not found');
    }

    await this.pipelineRepository.remove(lead);
  }

  async getKanban(withinHours?: number) {
    const leads =
      withinHours !== undefined
        ? await this.findRecent(withinHours)
        : await this.findAll();

    const statuses = [
      'New',
      'Contacted',
      'Replied',
      'Qualified',
      'Won',
      'Lost',
    ];

    return statuses.reduce(
      (result, status) => {
        result[status] = leads.filter(
          (lead) => lead.status === status,
        );

        return result;
      },
      {} as Record<string, PipelineLead[]>,
    );
  }
}