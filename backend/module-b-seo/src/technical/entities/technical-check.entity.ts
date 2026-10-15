import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class TechnicalCheck {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  url: string;

  @Column({ type: 'int' })
  score: number; // 0-100

  // JSON blob, same pattern as Audit — keeps schema stable as we add more checks
  @Column({ type: 'text' })
  details: string; // JSON.stringify(TechnicalDetails)

  @CreateDateColumn()
  createdAt: Date;
}