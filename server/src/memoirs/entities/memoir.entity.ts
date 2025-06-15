import { User } from '../../users/entities/user.entity'; // For relation if used
import { Chapter } from './chapter.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne, // If using direct relation to User
  JoinColumn, // If using direct relation to User
} from 'typeorm';

@Entity('memoirs')
export class Memoir {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  // Storing userId directly. Type should match User.id.
  // Assuming User.id is number based on previous User entity.
  @Column({ type: 'int' })
  userId: number;

  // Optional: Direct relation to User entity.
  // This requires User entity to be properly exported and imported,
  // and might need adjustments in UsersModule and MemoirsModule to avoid circular deps
  // if not handled carefully (e.g. via forwardRef).
  // For now, we'll keep it simple with userId, but include the commented code as a reference.

  @ManyToOne(() => User, (user) => user.memoirs, { onDelete: 'CASCADE', eager: false }) // eager: false to not always load it unless specified
  @JoinColumn({ name: 'userId' }) // This explicitly defines the FK column name
  user: User;


  @OneToMany(() => Chapter, (chapter) => chapter.memoir, { cascade: true, eager: false }) // cascade for easier creation/deletion of chapters with memoir
  chapters: Chapter[];

  @Column({ type: 'boolean', default: false })
  is_public: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updated_at: Date;
}
