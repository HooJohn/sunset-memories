import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Memoir } from './memoir.entity';

@Entity('comments')
export class Comment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  text: string;

  @Column({ type: 'int' }) // Assuming User ID is number
  userId: number;

  @ManyToOne(() => User, (user) => user.comments, { onDelete: 'CASCADE' }) // If user is deleted, their comments are deleted
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'uuid' })
  memoirId: string;

  @ManyToOne(() => Memoir, (memoir) => memoir.comments, { onDelete: 'CASCADE' }) // If memoir is deleted, its comments are deleted
  @JoinColumn({ name: 'memoirId' })
  memoir: Memoir;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  // No updated_at for comments, typically they are immutable once created
}
