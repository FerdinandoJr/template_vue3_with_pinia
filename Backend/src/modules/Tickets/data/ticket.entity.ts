import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, RelationId } from 'typeorm';
import { Tenant } from '../../../database/postgres/tenant.entity';
import { Customer } from '../../Customer/data/customer.entity';
import { User } from '../../../database/postgres/user.entity';

export enum TicketStatus {
  OPEN = 'open',
  IN_PROGRESS = 'in_progress',
  WAITING = 'waiting',
  RESOLVED = 'resolved',
  CLOSED = 'closed',
}

export enum TicketPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export enum TicketType {
  BUG = 'bug',
  FEATURE = 'feature',
  SUPPORT = 'support',
  INTERNAL = 'internal',
}

@Entity('tickets')
export class Ticket {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'enum', enum: TicketStatus, default: TicketStatus.OPEN })
  status: TicketStatus;

  @Column({ type: 'enum', enum: TicketPriority, default: TicketPriority.MEDIUM })
  priority: TicketPriority;

  @Column({ type: 'enum', enum: TicketType, default: TicketType.SUPPORT })
  type: TicketType;

  @Column({ type: 'timestamp', nullable: true })
  startDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  endDate: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  estimatedHours: number;

  @Column({ nullable: true })
  customerId: string;

  @ManyToOne(() => Customer)
  @JoinColumn({ name: 'customerId' })
  customer: Customer;

  @Column({ nullable: true })
  assignedTo: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'assignedTo' })
  assignee: User;

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