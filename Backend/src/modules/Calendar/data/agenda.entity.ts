import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Tenant } from '../../../database/postgres/tenant.entity';
import { User } from '../../../database/postgres/user.entity';
import { Customer } from '../../Customer/data/customer.entity';

export enum AgendaType {
  MEETING = 'meeting',
  CALL = 'call',
  TASK = 'task',
  REMINDER = 'reminder',
}

@Entity('agenda')
@Index('idx_agenda_tenant', ['tenantId'])
@Index('idx_agenda_assignee', ['assignedTo'])
@Index('idx_agenda_customer', ['customerId'])
export class Agenda {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'enum', enum: AgendaType, default: AgendaType.MEETING })
  type: AgendaType;

  @Column({ type: 'timestamp' })
  startDate: Date;

  @Column({ type: 'timestamp' })
  endDate: Date;

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

  @Column({ type: 'boolean', default: false })
  allDay: boolean;

  @Column({ type: 'varchar', length: 7, nullable: true })
  color: string;

  @Column({ type: 'varchar', length: 10, nullable: true })
  cep: string;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ type: 'text', nullable: true })
  postMeetingNotes: string;

  @Column({ type: 'boolean', default: false })
  isRecurring: boolean;

  @Column({ type: 'varchar', length: 20, nullable: true })
  recurrenceType: string;

  @Column({ type: 'jsonb', nullable: true })
  recurrenceDays: number[];

  @Column({ type: 'timestamp', nullable: true })
  recurrenceEndDate: Date;

  @Column({ type: 'boolean', default: false })
  isBlocker: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}