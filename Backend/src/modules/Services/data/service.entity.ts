import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
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
export class Service {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 50, unique: true })
  protocol: string;

  @Column({ length: 255 })
  subject: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ length: 20, nullable: true })
  document: string;

  @Column({ length: 255, nullable: true })
  email: string;

  @Column({ type: 'enum', enum: ServiceStatus, default: ServiceStatus.OPEN })
  status: ServiceStatus;

  @Column({ type: 'enum', enum: ServicePriority, default: ServicePriority.MEDIUM })
  priority: ServicePriority;

  @Column({ type: 'enum', enum: ServiceType, default: ServiceType.SUPPORT })
  type: ServiceType;

  @Column({ length: 255, nullable: true })
  lastAction: string;

  @Column({ type: 'timestamp', nullable: true })
  lastResumedAt: Date;

  @Column({ default: 0 })
  accumulatedTime: number;

  @Column({ length: 50, nullable: true })
  timeElapsed: string;

  @Column({ nullable: true })
  customerId: string;

  @ManyToOne(() => Customer)
  @JoinColumn({ name: 'customerId' })
  customer: Customer;

  @Column({ nullable: true })
  tenantId: string;

  @ManyToOne(() => Tenant)
  @JoinColumn({ name: 'tenantId' })
  tenant: Tenant;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity('service_history')
export class ServiceHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  serviceId: string;

  @ManyToOne(() => Service)
  @JoinColumn({ name: 'serviceId' })
  service: Service;

  @Column({ length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ length: 255 })
  author: string;

  @Column({ length: 50, default: 'info' })
  type: string;

  @Column({ length: 20, nullable: true })
  color: string;

  @Column({ length: 500, nullable: true })
  attachment: string;

  @Column({ type: 'timestamp', default: () => 'now()' })
  date: Date;
}