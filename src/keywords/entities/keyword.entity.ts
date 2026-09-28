import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { RankHistory } from './rank-history.entity';

@Entity()
export class Keyword {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  term: string; // e.g. "virtual receptionist"

  @Column({ type: 'varchar' })
  targetUrl: string; // the page we're tracking rank for

  // Cached research data (from the paid provider, or the mock until it's ready)
  @Column({ type: 'int', nullable: true })
  searchVolume: number | null;

  @Column({ type: 'int', nullable: true })
  difficulty: number | null; // 0-100

  // Latest known rank (denormalized for quick display; full history is in RankHistory)
  @Column({ type: 'int', nullable: true })
  currentRank: number | null;

  @Column({ type: 'boolean', default: true })
  isTracked: boolean; // lets the user pause tracking without deleting history

  @OneToMany(() => RankHistory, (rh) => rh.keyword)
  rankHistory: RankHistory[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}