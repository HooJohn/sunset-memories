import { User } from '../../users/entities/user.entity';
import { Chapter } from './chapter.entity';
import { Comment } from './comment.entity';
import { Like } from './like.entity'; // Import the new Like entity
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity('memoirs')
export class Memoir {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'int' })
  userId: number;

  @ManyToOne(() => User, (user) => user.memoirs, { onDelete: 'CASCADE', eager: false })
  @JoinColumn({ name: 'userId' })
  user: User;

  @OneToMany(() => Chapter, (chapter) => chapter.memoir, { cascade: true, eager: false })
  chapters: Chapter[];

  @OneToMany(() => Comment, (comment) => comment.memoir, { cascade: true, eager: false })
  comments: Comment[];

  @OneToMany(() => Like, (like) => like.memoir, { cascade: true, eager: false }) // Added likes relation
  likes: Like[];

  @Column({ type: 'int', default: 0 }) // Added likeCount column
  likeCount: number;

  @Column({ type: 'boolean', default: false })
  is_public: boolean;

  @Column({ type: 'text', nullable: true })
  content_html: string;

  @Column({ type: 'text', nullable: true })
  transcribed_text: string;

  @Column({ type: 'text', nullable: true })
  chapters_json: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updated_at: Date;
}
