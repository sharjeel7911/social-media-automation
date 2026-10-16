import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Between,
  FindOptionsWhere,
  LessThanOrEqual,
  Not,
  Repository,
} from 'typeorm';
import { Post, PostPlatform } from './entities/post.entity';
import { PostStatus, assertTransition } from './post-status';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

const MAX_RETRIES = 3;
// Inline UTM slug/short-URL builder (no paid shortener API needed).
const SHORT_URL_BASE = process.env.SHORT_URL_BASE ?? 'https://sma.link';

function buildUtmUrl(originalUrl: string, dto: {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
}): string {
  try {
    const u = new URL(originalUrl);
    if (dto.utmSource)   u.searchParams.set('utm_source',   dto.utmSource);
    if (dto.utmMedium)   u.searchParams.set('utm_medium',   dto.utmMedium);
    if (dto.utmCampaign) u.searchParams.set('utm_campaign', dto.utmCampaign);
    // Build a short URL token that encodes the final tagged URL.
    const token = Buffer.from(u.toString()).toString('base64url').slice(0, 12);
    return `${SHORT_URL_BASE}/${token}`;
  } catch {
    return originalUrl;
  }
}

@Injectable()
export class PostsService {
  private readonly log = new Logger(PostsService.name);

  constructor(@InjectRepository(Post) private readonly repo: Repository<Post>) {}

  // ---------------------------------------------------------------------------
  // Create
  // ---------------------------------------------------------------------------
  create(dto: CreatePostDto) {
    let shortUrl: string | null = null;
    if (dto.originalUrl) {
      shortUrl = buildUtmUrl(dto.originalUrl, dto);
    }

    const post = this.repo.create({
      content: dto.content,
      mediaUrl: dto.mediaUrl ?? null,
      platform: (dto.platform as PostPlatform) ?? 'linkedin',
      status: (dto.status as PostStatus) ?? PostStatus.DRAFT,
      originalUrl: dto.originalUrl ?? null,
      shortUrl,
      utmSource: dto.utmSource ?? null,
      utmMedium: dto.utmMedium ?? null,
      utmCampaign: dto.utmCampaign ?? null,
      isEvergreen: dto.isEvergreen ?? false,
      recycleIntervalDays: dto.recycleIntervalDays ?? null,
      recycleCount: 0,
    });
    return this.repo.save(post);
  }

  // ---------------------------------------------------------------------------
  // Bulk CSV import — accepts a list of CreatePostDtos, inserts them all
  // in a single transaction and returns the created posts.
  // ---------------------------------------------------------------------------
  async bulkCreate(dtos: CreatePostDto[]): Promise<Post[]> {
    if (!dtos.length) throw new BadRequestException('No posts provided.');
    if (dtos.length > 500) throw new BadRequestException('Maximum 500 posts per import.');
    const posts = dtos.map((dto) => {
      let shortUrl: string | null = null;
      if (dto.originalUrl) shortUrl = buildUtmUrl(dto.originalUrl, dto);
      return this.repo.create({
        content: dto.content,
        mediaUrl: dto.mediaUrl ?? null,
        platform: (dto.platform as PostPlatform) ?? 'linkedin',
        status: (dto.status as PostStatus) ?? PostStatus.DRAFT,
        originalUrl: dto.originalUrl ?? null,
        shortUrl,
        utmSource: dto.utmSource ?? null,
        utmMedium: dto.utmMedium ?? null,
        utmCampaign: dto.utmCampaign ?? null,
        isEvergreen: dto.isEvergreen ?? false,
        recycleIntervalDays: dto.recycleIntervalDays ?? null,
        recycleCount: 0,
      });
    });
    return this.repo.save(posts);
  }

  // ---------------------------------------------------------------------------
  // Read
  // ---------------------------------------------------------------------------
  findAll(filter: {
    status?: string;
    platform?: string;
    from?: string;
    to?: string;
    evergreen?: string;
  } = {}) {
    const where: FindOptionsWhere<Post> = {};

    if (filter.status) {
      if (!Object.values(PostStatus).includes(filter.status as PostStatus)) {
        throw new BadRequestException('Invalid status filter');
      }
      where.status = filter.status as PostStatus;
    }

    if (filter.platform) {
      where.platform = filter.platform as PostPlatform;
    }

    if (filter.evergreen !== undefined) {
      where.isEvergreen = filter.evergreen === 'true';
    }

    if (filter.from || filter.to) {
      const from = filter.from ? new Date(filter.from) : new Date(0);
      const to   = filter.to   ? new Date(filter.to)   : new Date('9999-12-31');
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
      throw new BadRequestException(
        `Cannot edit a post that is ${post.status}. Unschedule it first.`,
      );
    }
    if (dto.content  !== undefined) post.content  = dto.content;
    if (dto.mediaUrl !== undefined) post.mediaUrl  = dto.mediaUrl;
    if (dto.platform !== undefined) post.platform  = dto.platform as PostPlatform;
    if (dto.isEvergreen !== undefined) post.isEvergreen = dto.isEvergreen;
    if (dto.recycleIntervalDays !== undefined) post.recycleIntervalDays = dto.recycleIntervalDays;

    // Re-build short URL if URL-related fields changed.
    if (dto.originalUrl !== undefined) {
      post.originalUrl = dto.originalUrl;
      post.utmSource   = dto.utmSource   ?? post.utmSource;
      post.utmMedium   = dto.utmMedium   ?? post.utmMedium;
      post.utmCampaign = dto.utmCampaign ?? post.utmCampaign;
      post.shortUrl    = dto.originalUrl ? buildUtmUrl(dto.originalUrl, {
        utmSource:   post.utmSource   ?? undefined,
        utmMedium:   post.utmMedium   ?? undefined,
        utmCampaign: post.utmCampaign ?? undefined,
      }) : null;
    }

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

  // ---------------------------------------------------------------------------
  // Scheduling & approval workflow
  // ---------------------------------------------------------------------------
  async schedule(id: number, when: Date) {
    if (isNaN(when.getTime())) throw new BadRequestException('Invalid scheduledAt');
    if (when.getTime() < Date.now() - 60_000) {
      throw new BadRequestException('scheduledAt must be in the future');
    }
    const post = await this.findOne(id);
    assertTransition(post.status, PostStatus.SCHEDULED);
    post.status      = PostStatus.SCHEDULED;
    post.scheduledAt = when;
    post.retryCount  = 0;
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

  // ---------------------------------------------------------------------------
  // Scheduler helpers
  // ---------------------------------------------------------------------------
  findDue(now: Date) {
    return this.repo.find({
      where: { status: PostStatus.SCHEDULED, scheduledAt: LessThanOrEqual(now) },
      order: { scheduledAt: 'ASC' },
    });
  }

  /** Find evergreen posts that are ready to be re-queued. */
  findDueRecycles(now: Date) {
    return this.repo.find({
      where: {
        isEvergreen: true,
        status: PostStatus.PUBLISHED,
        nextRecycleAt: LessThanOrEqual(now),
      },
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
    const post = await this.findOne(id);
    const nextRecycleAt =
      post.isEvergreen && post.recycleIntervalDays
        ? (() => {
            const d = new Date();
            d.setDate(d.getDate() + post.recycleIntervalDays!);
            return d;
          })()
        : null;

    await this.repo.update(id, {
      status: PostStatus.PUBLISHED,
      publishedAt: new Date(),
      externalPostId: externalId,
      errorMessage: null,
      nextRecycleAt,
      recycleCount: post.recycleCount + 1,
    });
  }

  async markFailed(id: number, message: string) {
    const post = await this.findOne(id);
    const retryCount = post.retryCount + 1;
    if (retryCount < MAX_RETRIES) {
      await this.repo.update(id, {
        status: PostStatus.SCHEDULED,
        retryCount,
        errorMessage: message,
      });
    } else {
      await this.repo.update(id, {
        status: PostStatus.FAILED,
        retryCount,
        errorMessage: message,
      });
    }
  }

  // ---------------------------------------------------------------------------
  // Evergreen recycle queue — re-schedule published evergreen posts
  // ---------------------------------------------------------------------------
  async recycleEvergreen(): Promise<number> {
    const due = await this.findDueRecycles(new Date());
    let count = 0;
    for (const post of due) {
      const nextScheduled = new Date();
      nextScheduled.setDate(nextScheduled.getDate() + (post.recycleIntervalDays ?? 7));
      await this.repo.update(post.id, {
        status: PostStatus.SCHEDULED,
        scheduledAt: nextScheduled,
        nextRecycleAt: null,
        retryCount: 0,
        errorMessage: null,
      });
      this.log.log(`Recycled evergreen post #${post.id} → scheduled for ${nextScheduled.toISOString()}`);
      count++;
    }
    return count;
  }

  // ---------------------------------------------------------------------------
  // Stats endpoint (for Module D aggregation)
  // ---------------------------------------------------------------------------
  async getStats() {
    const [total, scheduled, published, failed, drafts] = await Promise.all([
      this.repo.count(),
      this.repo.count({ where: { status: PostStatus.SCHEDULED } }),
      this.repo.count({ where: { status: PostStatus.PUBLISHED } }),
      this.repo.count({ where: { status: PostStatus.FAILED } }),
      this.repo.count({ where: { status: PostStatus.DRAFT } }),
    ]);

    // Published in the last 30 days
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 30);
    const publishedLast30 = await this.repo.count({
      where: {
        status: PostStatus.PUBLISHED,
        publishedAt: Not(LessThanOrEqual(cutoff)),
      },
    });

    // Upcoming posts (scheduled, soonest first), max 10
    const upcoming = await this.repo.find({
      where: { status: PostStatus.SCHEDULED },
      order: { scheduledAt: 'ASC' },
      take: 10,
    });

    return { total, scheduled, published, failed, drafts, publishedLast30, upcoming };
  }
}