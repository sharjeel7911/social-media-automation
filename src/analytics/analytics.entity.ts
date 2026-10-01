import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('analytics')
export class Analytics {
  @PrimaryGeneratedColumn()
  id: number;

@Column({ default: 'linkedin' })
platform: string;

  @Column({ nullable: true })
  postId: number;

  @Column({ default: 0 })
  impressions: number;

  @Column({ default: 0 })
  likes: number;

  @Column({ default: 0 })
  comments: number;

  @Column({ default: 0 })
  shares: number;

  @Column({ default: 0 })
  clicks: number;

  @Column({ default: 0 })
  followers: number;

  @Column({ default: 0 })
  engagementRate: number;

  @Column({ type: 'datetime' })
  recordedAt: Date;

  @CreateDateColumn()
  createdAt: Date;
}