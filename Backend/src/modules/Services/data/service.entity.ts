import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Tenant } from '../../../database/postgres/tenant.entity';
import { Customer } from '../../Customer/data/customer.entity';

export enum ServiceStatus {
  OPEN = 'open',
  IN_PROGRESS = 'in_progress',
  WAITING = 'waiting',
  RESOLVED = 'resolved',
  CLOSED = 'closed',
}

export enum ServicePriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export enum ServiceType {
  BUG = 'bug',
  FEATURE = 'feature',
  SUPPORT = 'support',
  INTERNAL = 'internal',
}

@Entity('services')
@Index('idx_services_protocol', ['protocol'], { unique: true })
@Index('idx_services_tenant', ['tenantId'])
@Index('idx_services_customer', ['customerId'])
export class Service {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  protocol: string;

  @Column({ type: 'varchar', length: 255 })
  subject: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  document: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  email: string;

  @Column({ type: 'enum', enum: ServiceStatus, default: ServiceStatus.OPEN })
  status: ServiceStatus;

  @Column({ type: 'enum', enum: ServicePriority, default: ServicePriority.MEDIUM })
  priority: ServicePriority;

  @Column({ type: 'enum', enum: ServiceType, default: ServiceType.SUPPORT })
  type: ServiceType;

  @Column({ type: 'varchar', length: 255, nullable: true })
  lastAction: string;

  @Column({ type: 'timestamp', nullable: true })
  lastResumedAt: Date;

  @Column({ type: 'integer', default: 0 })
  accumulatedTime: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  timeElapsed: string;

  @Column({ type: 'uuid', nullable: true })
  customerId: string;

  @ManyToOne(() => Customer, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'customerId' })
  customer: Customer;

  @Column({ type: 'uuid', nullable: true })
  tenantId: string;

  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenantId' })
  tenant: Tenant;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}

@Entity('service_history')
@Index('idx_service_history_service', ['serviceId'])
export class ServiceHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  serviceId: string;

  @ManyToOne(() => Service, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'serviceId' })
  service: Service;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 255 })
  author: string;

  @Column({ type: 'varchar', length: 50, default: 'info' })
  type: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  color: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  attachment: string;

  @Column({ type: 'timestamp', default: () => 'now()' })
  date: Date;
}