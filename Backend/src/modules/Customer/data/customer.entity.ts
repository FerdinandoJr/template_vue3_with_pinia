import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Tenant } from '../../../database/postgres/tenant.entity';

export enum CustomerStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  BLOCKED = 'blocked',
}

export interface IContactPerson {
  name: string;
  role?: string;
  phone?: string;
  email?: string;
}

@Entity('customers')
@Index('idx_customers_tenant_email', ['tenantId', 'email'])
@Index('idx_customers_tenant', ['tenantId'])
export class Customer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  email: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  avatar: string;

  @Column({ type: 'enum', enum: CustomerStatus, default: CustomerStatus.ACTIVE })
  status: CustomerStatus;

  @Column({ type: 'varchar', length: 100, nullable: true })
  source: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  companyName: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  tradeName: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  responsibleName: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  document: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  website: string;

  @Column({ type: 'varchar', length: 10, nullable: true })
  zipCode: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  street: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  number: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  complement: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  neighborhood: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  city: string;

  @Column({ type: 'varchar', length: 2, nullable: true })
  state: string;

  @Column({ type: 'jsonb', nullable: true })
  contacts: string[];

  @Column({ type: 'jsonb', nullable: true })
  additionalContacts: IContactPerson[];

  @Column({ type: 'timestamp', nullable: true })
  lastInteraction: Date;

  @Column({ type: 'integer', default: 0 })
  openTickets: number;

  @Column({ type: 'decimal', precision: 3, scale: 2, nullable: true })
  csat: number;

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