import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Audit {
  @PrimaryGeneratedColumn()
  id: number;

  // What was audited
  @Column({ type: 'varchar', nullable: true })
  url: string | null;

  @Column({ type: 'text', nullable: true })
  rawContent: string | null; // used when auditing draft text instead of a live URL

  @Column({ type: 'varchar', nullable: true })
  targetKeyword: string | null;

  // Overall result
  @Column({ type: 'int' })
  score: number; // 0-100

  // Extracted facts (stored as JSON text so we don't need a dozen columns)
  @Column({ type: 'text' })
  details: string; // JSON.stringify(AuditDetails)

  @CreateDateColumn()
  createdAt: Date;
}