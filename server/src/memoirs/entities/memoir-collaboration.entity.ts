import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Memoir } from './memoir.entity';
import { User } from '../../users/entities/user.entity'; // Assuming User entity path
import { CollaborationRole } from '../enums/collaboration-role.enum'; // Corrected import
import { CollaborationStatus } from '../enums/collaboration-status.enum'; // Corrected import

@Entity('memoir_collaborations')
@Index(['memoirId', 'collaboratorId'], { unique: true }) // Ensure a user cannot be invited multiple times to the same memoir
export class MemoirCollaboration {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  memoirId: string;

  @ManyToOne(() => Memoir, { onDelete: 'CASCADE' }) // If memoir is deleted, collaboration record is removed
  @JoinColumn({ name: 'memoirId' })
  memoir: Memoir;

  @Column({ type: 'int' }) // Assuming User ID is int
  collaboratorId: number;

  @ManyToOne(() => User, { eager: false, onDelete: 'CASCADE' }) // Eager load can be false to optimize queries unless always needed
  @JoinColumn({ name: 'collaboratorId' })
  collaborator: User; // The invited user

  @Column({ type: 'int' }) // Assuming User ID is int
  invitedById: number;

  @ManyToOne(() => User, { eager: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'invitedById' })
  invitedByUser: User; // The user who sent the invite (memoir owner)

  @Column({
    type: 'enum',
    enum: CollaborationRole,
    default: CollaborationRole.VIEWER,
  })
  role: CollaborationRole;

  @Column({
    type: 'enum',
    enum: CollaborationStatus,
    default: CollaborationStatus.PENDING,
  })
  status: CollaborationStatus;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updated_at: Date;
}
