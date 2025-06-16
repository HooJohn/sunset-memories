import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Memoir } from '../../memoirs/entities/memoir.entity';
import { ServiceType } from '../enums/service-type.enum';
import { ServiceRequestStatus } from '../enums/service-request-status.enum';

@Entity('service_requests')
export class ServiceRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'int' })
  userId: number;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'uuid', nullable: true })
  memoirId?: string;

  @ManyToOne(() => Memoir, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'memoirId' })
  memoir?: Memoir;

  @Column({
    type: 'enum',
    enum: ServiceType,
  })
  serviceType: ServiceType;

  @Column({ type: 'text' })
  details: string;

  // @Column({ type: 'varchar', length: 50, nullable: true }) // Removed contactPreference
  // contactPreference: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  contactPhone: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  address: string;

  @Column({ type: 'date', nullable: true }) // Storing as date
  preferredDate: Date;

  @Column({
    type: 'enum',
    enum: ServiceRequestStatus,
    default: ServiceRequestStatus.PENDING_REVIEW,
  })
  status: ServiceRequestStatus;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updated_at: Date;
}
