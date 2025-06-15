import { Memoir } from './memoir.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity('chapters')
export class Chapter {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Memoir, (memoir) => memoir.chapters, { onDelete: 'CASCADE' }) // onDelete: 'CASCADE' ensures chapters are deleted if memoir is deleted
  @JoinColumn({ name: 'memoirId' }) // Foreign key
  memoir: Memoir;

  @Column() // This will store the memoir's ID
  memoirId: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true }) // For HTML content from a rich text editor
  content: string;

  @Column({ type: 'int' })
  order: number; // For chapter sequence

  @CreateDateColumn({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updated_at: Date;
}
