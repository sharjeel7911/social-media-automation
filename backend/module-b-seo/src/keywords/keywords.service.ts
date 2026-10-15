import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Keyword } from './entities/keyword.entity';
import { RankHistory } from './entities/rank-history.entity';
import { CreateKeywordDto } from './dto/create-keyword.dto';
import { UpdateKeywordDto } from './dto/update-keyword.dto';
import { KEYWORD_DATA_PROVIDER } from './keyword-data.provider';
import type { KeywordDataProvider } from './keyword-data.provider';

@Injectable()
export class KeywordsService {
  constructor(
    @InjectRepository(Keyword) private readonly keywordRepo: Repository<Keyword>,
    @InjectRepository(RankHistory) private readonly rankRepo: Repository<RankHistory>,
    @Inject(KEYWORD_DATA_PROVIDER) private readonly provider: KeywordDataProvider,
  ) {}

  // ---------- CRUD ----------
  async create(dto: CreateKeywordDto) {
    const research = await this.provider.research(dto.term);

    const keyword = this.keywordRepo.create({
      term: dto.term,
      targetUrl: dto.targetUrl,
      searchVolume: research.searchVolume,
      difficulty: research.difficulty,
      currentRank: null,
      isTracked: true,
    });

    return this.keywordRepo.save(keyword);
  }

  findAll(filter: { isTracked?: boolean } = {}) {
    const where = filter.isTracked !== undefined ? { isTracked: filter.isTracked } : {};
    return this.keywordRepo.find({ where, order: { createdAt: 'DESC' } });
  }

  async findOne(id: number) {
    const keyword = await this.keywordRepo.findOneBy({ id });
    if (!keyword) throw new NotFoundException(`Keyword ${id} not found`);
    return keyword;
  }

  async update(id: number, dto: UpdateKeywordDto) {
    const keyword = await this.findOne(id);
    if (dto.targetUrl !== undefined) keyword.targetUrl = dto.targetUrl;
    if (dto.isTracked !== undefined) keyword.isTracked = dto.isTracked;
    return this.keywordRepo.save(keyword);
  }

  async remove(id: number) {
    const keyword = await this.findOne(id);
    await this.keywordRepo.remove(keyword);
    return { deleted: true, id };
  }

  // ---------- Keyword research (standalone, doesn't require a tracked keyword) ----------
  research(term: string) {
    if (!term?.trim()) throw new BadRequestException('term is required');
    return this.provider.research(term);
  }

  // ---------- Rank checking ----------
  async checkRankNow(id: number) {
    const keyword = await this.findOne(id);
    const result = await this.provider.checkRank(keyword.term, keyword.targetUrl);

    const history = this.rankRepo.create({ keywordId: keyword.id, rank: result.rank });
    await this.rankRepo.save(history);

    keyword.currentRank = result.rank;
    await this.keywordRepo.save(keyword);

    return { keyword, rankCheck: history };
  }

  async getRankHistory(id: number) {
    await this.findOne(id); // 404 if it doesn't exist
    return this.rankRepo.find({ where: { keywordId: id }, order: { checkedAt: 'ASC' } });
  }

  // ---------- Used by the daily scheduler later ----------
  findAllTracked() {
    return this.keywordRepo.find({ where: { isTracked: true } });
  }
}