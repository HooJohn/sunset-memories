import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Memoir } from '../../memoirs/entities/memoir.entity';
import { Comment } from '../../memoirs/entities/comment.entity';
import { Like } from '../../memoirs/entities/like.entity'; // Import the new Like entity
// import { MemoirCollaboration } from '../../memoirs/entities/memoir-collaboration.entity'; // For future relations
// import { ServiceRequest } from '../../service-requests/entities/service-request.entity'; // For future relations

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50, unique: true })
  phone: string;

  @Column({ type: 'varchar', select: false, nullable: true })
  password?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  name: string;

  @Column({ type: 'varchar', length: 50, nullable: true, unique: false })
  nickname: string;

  @Column({ type: 'varchar', nullable: true })
  avatar_url: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updated_at: Date;

  @OneToMany(() => Memoir, (memoir) => memoir.user)
  memoirs: Memoir[];

  @OneToMany(() => Comment, (comment) => comment.user)
  comments: Comment[];

  @OneToMany(() => Like, (like) => like.user) // Added likes relation
  likes: Like[];

  // If you also want to link collaborations directly from user:
  // @OneToMany(() => MemoirCollaboration, (collaboration) => collaboration.collaborator)
  // collaborationsAsCollaborator: MemoirCollaboration[];

  // @OneToMany(() => MemoirCollaboration, (collaboration) => collaboration.invitedByUser)
  // collaborationsInvitedByMe: MemoirCollaboration[];

  // If you also want to link service requests directly from user:
  // @OneToMany(() => ServiceRequest, (request) => request.user)
  // serviceRequests: ServiceRequest[];
}
