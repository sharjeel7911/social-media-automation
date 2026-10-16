import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { PostStatus } from '../post-status';

// Platforms supported for publishing.
export type PostPlatform =
  | 'linkedin'
  | 'facebook'
  | 'instagram'
  | 'twitter'
  | 'tiktok'
  | 'youtube'
  | 'pinterest'
  | 'gbp';

@Entity()
export class Post {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'text', nullable: true })
  mediaUrl: string | null;

  // Which social platform this post targets.
  @Column({ type: 'varchar', default: 'linkedin' })
  platform: PostPlatform;

  @Column({ type: 'varchar', default: PostStatus.DRAFT })
  status: PostStatus;

  @Column({ type: 'datetime', nullable: true })
  scheduledAt: Date | null;

  @Column({ type: 'datetime', nullable: true })
  publishedAt: Date | null;

  @Column({ type: 'varchar', nullable: true })
  externalPostId: string | null;

  @Column({ type: 'text', nullable: true })
  errorMessage: string | null;

  @Column({ type: 'int', default: 0 })
  retryCount: number;

  // ---- UTM / link-shortening ----
  // The original URL embedded in content before shortening.
  @Column({ type: 'text', nullable: true })
  originalUrl: string | null;

  // The shortened URL (with UTM params appended) that replaces the original.
  @Column({ type: 'text', nullable: true })
  shortUrl: string | null;

  // Campaign tracking tokens appended to every link in content.
  @Column({ type: 'varchar', nullable: true })
  utmSource: string | null;

  @Column({ type: 'varchar', nullable: true })
  utmMedium: string | null;

  @Column({ type: 'varchar', nullable: true })
  utmCampaign: string | null;

  // ---- Evergreen / recycling queue ----
  // If true, after publishing the post will be re-queued after recycleIntervalDays.
  @Column({ type: 'boolean', default: false })
  isEvergreen: boolean;

  // How many days between automatic re-publishes (null = one-shot).
  @Column({ type: 'int', nullable: true })
  recycleIntervalDays: number | null;

  // Timestamp when this post should next be re-published (set by scheduler).
  @Column({ type: 'datetime', nullable: true })
  nextRecycleAt: Date | null;

  // Count of how many times this post has been recycled.
  @Column({ type: 'int', default: 0 })
  recycleCount: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}