import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Tenant } from '../../../database/postgres/tenant.entity';
import { Customer } from '../../Customer/data/customer.entity';
import { User } from '../../../database/postgres/user.entity';
import { Ticket } from '../../Tickets/data/ticket.entity';

export enum ServiceRecordStatus {
  OPEN = 'open',
  IN_PROGRESS = 'in_progress',
  WAITING = 'waiting',
  RESOLVED = 'resolved',
  CLOSED = 'closed',
}

export enum ServiceRecordChannel {
  CHAT = 'chat',
  WHATSAPP = 'whatsapp',
  EMAIL = 'email',
  PHONE = 'phone',
}

@Entity('service_records')
@Index('idx_service_records_tenant', ['tenantId'])
@Index('idx_service_records_customer', ['customerId'])
@Index('idx_service_records_attendant', ['attendantId'])
@Index('idx_service_records_status', ['tenantId', 'status'])
export class ServiceRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  serviceNumber: string;

  @Column({ type: 'varchar', length: 255 })
  subject: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'enum', enum: ServiceRecordStatus, default: ServiceRecordStatus.OPEN })
  status: ServiceRecordStatus;

  @Column({ type: 'enum', enum: ServiceRecordChannel, default: ServiceRecordChannel.CHAT })
  channel: ServiceRecordChannel;

  @Column({ type: 'uuid', nullable: true })
  customerId: string;

  @ManyToOne(() => Customer, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'customerId' })
  customer: Customer;

  @Column({ type: 'uuid', nullable: true })
  attendantId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'attendantId' })
  attendant: User;

  @Column({ type: 'uuid', nullable: true })
  ticketId: string;

  @ManyToOne(() => Ticket, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'ticketId' })
  ticket: Ticket;

  @Column({ type: 'uuid', nullable: true })
  tenantId: string;

  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenantId' })
  tenant: Tenant;

  @Column({ type: 'timestamp', nullable: true })
  startDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  endDate: Date;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}