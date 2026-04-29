import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index, OneToMany } from 'typeorm';
import { Tenant } from '../../../database/postgres/tenant.entity';
import { Customer } from '../../Customer/data/customer.entity';
import { User } from '../../../database/postgres/user.entity';
import { TicketTag } from './ticket-tag.entity';
import { TicketChecklist } from './ticket-checklist.entity';
import { TicketAttachment } from './ticket-attachment.entity';

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
@Index('idx_tickets_tenant', ['tenantId'])
@Index('idx_tickets_customer', ['customerId'])
@Index('idx_tickets_assignee', ['assignedTo'])
@Index('idx_tickets_number', ['tenantId', 'ticketNumber'])
export class Ticket {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  ticketNumber: string;

  @Column({ type: 'varchar', length: 255 })
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

  @Column({ type: 'uuid', nullable: true })
  customerId: string;

  @ManyToOne(() => Customer, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'customerId' })
  customer: Customer;

  @Column({ type: 'uuid', nullable: true })
  assignedTo: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'assignedTo' })
  assignee: User;

  @Column({ type: 'uuid', nullable: true })
  tenantId: string;

  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenantId' })
  tenant: Tenant;

  @OneToMany(() => TicketTag, tag => tag.ticket, { cascade: true })
  tags: TicketTag[];

  @OneToMany(() => TicketChecklist, checklist => checklist.ticket, { cascade: true })
  checklist: TicketChecklist[];

  @OneToMany(() => TicketAttachment, attachment => attachment.ticket, { cascade: true })
  attachments: TicketAttachment[];

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}