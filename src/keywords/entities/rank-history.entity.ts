import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Keyword } from './keyword.entity';

@Entity()
export class RankHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Keyword, (k) => k.rankHistory, { onDelete: 'CASCADE' })
  keyword: Keyword;

  @Column()
  keywordId: number;

  @Column({ type: 'int', nullable: true })
  rank: number | null; // null = not found in top results that day

  @CreateDateColumn()
  checkedAt: Date;
}