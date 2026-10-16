import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PostsService } from './posts.service';
import { PUBLISHER } from './publisher';
import type { Publisher } from './publisher';

@Injectable()
export class SchedulerService {
  private readonly log = new Logger(SchedulerService.name);
  private running = false;

  constructor(
    private readonly posts: PostsService,
    @Inject(PUBLISHER) private readonly publisher: Publisher,
  ) {}

  /** Main scheduling tick — fires every minute.
   *  SOW tolerance window is 5 minutes, so every-minute is well within spec. */
  @Cron('* * * * *')
  async tick() {
    if (this.running) return; // never overlap runs
    this.running = true;
    try {
      // 1. Publish any posts whose scheduled time has arrived.
      const due = await this.posts.findDue(new Date());
      for (const post of due) {
        const claimed = await this.posts.claim(post.id);
        if (!claimed) continue;
        try {
          const result = await this.publisher.publish(post);
          await this.posts.markPublished(post.id, result.externalId);
          this.log.log(`Published post #${post.id} on ${post.platform}`);
        } catch (e) {
          this.log.error(`Post #${post.id} failed: ${e}`);
          await this.posts.markFailed(post.id, String(e));
        }
      }

      // 2. Re-queue any evergreen posts whose recycle window has elapsed.
      const recycled = await this.posts.recycleEvergreen();
      if (recycled > 0) {
        this.log.log(`Recycled ${recycled} evergreen post(s) back to SCHEDULED.`);
      }
    } finally {
      this.running = false;
    }
  }
}