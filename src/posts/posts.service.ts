import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, FindOptionsWhere, LessThanOrEqual, Repository } from 'typeorm';
import { Post } from './entities/post.entity';
import { PostStatus, assertTransition } from './post-status';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

const MAX_RETRIES = 3;

@Injectable()
export class PostsService {
  constructor(@InjectRepository(Post) private readonly repo: Repository<Post>) {}


  create(dto: CreatePostDto) {
    const post = this.repo.create({
      content: dto.content,
      mediaUrl: dto.mediaUrl ?? null,
      status: (dto.status as PostStatus) ?? PostStatus.DRAFT,
    });
    return this.repo.save(post);
  }


  findAll(filter: { status?: string; from?: string; to?: string } = {}) {
    const where: FindOptionsWhere<Post> = {};

    if (filter.status) {
      if (!Object.values(PostStatus).includes(filter.status as PostStatus)) {
        throw new BadRequestException('Invalid status filter');
      }
      where.status = filter.status as PostStatus;
    }

    if (filter.from || filter.to) {
      const from = filter.from ? new Date(filter.from) : new Date(0);
      const to = filter.to ? new Date(filter.to) : new Date('9999-12-31');
      if (isNaN(from.getTime()) || isNaN(to.getTime())) {
        throw new BadRequestException('Invalid from/to date');
      }
      where.scheduledAt = Between(from, to);
    }

    return this.repo.find({ where, order: { scheduledAt: 'ASC', createdAt: 'DESC' } });
  }

  async findOne(id: number) {
    const post = await this.repo.findOneBy({ id });
    if (!post) throw new NotFoundException(`Post ${id} not found`);
    return post;
  }

  async update(id: number, dto: UpdatePostDto) {
    const post = await this.findOne(id);
    if (![PostStatus.DRAFT, PostStatus.PENDING_REVIEW].includes(post.status)) {
      throw new BadRequestException(`Cannot edit a post that is ${post.status}. Unschedule it first.`);
    }
    if (dto.content !== undefined) post.content = dto.content;
    if (dto.mediaUrl !== undefined) post.mediaUrl = dto.mediaUrl;
    return this.repo.save(post);
  }

  async remove(id: number) {
    const post = await this.findOne(id);
    if (post.status === PostStatus.PUBLISHING) {
      throw new BadRequestException('Cannot delete a post while it is being published');
    }
    await this.repo.remove(post);
    return { deleted: true, id };
  }


  async schedule(id: number, when: Date) {
    if (isNaN(when.getTime())) throw new BadRequestException('Invalid scheduledAt');
    if (when.getTime() < Date.now() - 60_000) {
      throw new BadRequestException('scheduledAt must be in the future');
    }
    const post = await this.findOne(id);
    assertTransition(post.status, PostStatus.SCHEDULED);
    post.status = PostStatus.SCHEDULED;
    post.scheduledAt = when;
    post.retryCount = 0;
    post.errorMessage = null;
    return this.repo.save(post);
  }


  async changeStatus(id: number, to: PostStatus) {
    const post = await this.findOne(id);
    assertTransition(post.status, to);
    post.status = to;
    if (to === PostStatus.DRAFT) post.scheduledAt = null;
    return this.repo.save(post);
  }

  findDue(now: Date) {
    return this.repo.find({
      where: { status: PostStatus.SCHEDULED, scheduledAt: LessThanOrEqual(now) },
      order: { scheduledAt: 'ASC' },
    });
  }

  async claim(id: number): Promise<boolean> {
    const res = await this.repo.update(
      { id, status: PostStatus.SCHEDULED },
      { status: PostStatus.PUBLISHING },
    );
    return (res.affected ?? 0) > 0;
  }

  async markPublished(id: number, externalId: string) {
    await this.repo.update(id, {
      status: PostStatus.PUBLISHED,
      publishedAt: new Date(),
      externalPostId: externalId,
      errorMessage: null,
    });
  }

  async markFailed(id: number, message: string) {
    const post = await this.findOne(id);
    const retryCount = post.retryCount + 1;
    if (retryCount < MAX_RETRIES) {
     
      await this.repo.update(id, { status: PostStatus.SCHEDULED, retryCount, errorMessage: message });
    } else {
      await this.repo.update(id, { status: PostStatus.FAILED, retryCount, errorMessage: message });
    }
  }
}