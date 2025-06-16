import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Memoir } from './memoir.entity';

@Entity('likes')
@Unique(['userId', 'memoirId']) // Ensure a user can only like a memoir once
export class Like {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'int' }) // Assuming User ID is number
  userId: number;

  @ManyToOne(() => User, (user) => user.likes, { onDelete: 'CASCADE' }) // If user is deleted, their likes are deleted
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'uuid' })
  memoirId: string;

  @ManyToOne(() => Memoir, (memoir) => memoir.likes, { onDelete: 'CASCADE' }) // If memoir is deleted, its likes are deleted
  @JoinColumn({ name: 'memoirId' })
  memoir: Memoir;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;
}
