import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
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
export class Customer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  name: string;

  @Column({ length: 255, nullable: true })
  email: string;

  @Column({ length: 20, nullable: true })
  phone: string;

  @Column({ length: 500, nullable: true })
  avatar: string;

  @Column({ type: 'enum', enum: CustomerStatus, default: CustomerStatus.ACTIVE })
  status: CustomerStatus;

  @Column({ length: 100, nullable: true })
  source: string;

  @Column({ length: 255, nullable: true })
  companyName: string;

  @Column({ length: 255, nullable: true })
  tradeName: string;

  @Column({ length: 255, nullable: true })
  responsibleName: string;

  @Column({ length: 20, nullable: true })
  document: string;

  @Column({ length: 255, nullable: true })
  website: string;

  @Column({ length: 10, nullable: true })
  zipCode: string;

  @Column({ length: 255, nullable: true })
  street: string;

  @Column({ length: 20, nullable: true })
  number: string;

  @Column({ length: 100, nullable: true })
  complement: string;

  @Column({ length: 100, nullable: true })
  neighborhood: string;

  @Column({ length: 100, nullable: true })
  city: string;

  @Column({ length: 2, nullable: true })
  state: string;

  @Column({ type: 'jsonb', nullable: true })
  contacts: string[];

  @Column({ type: 'jsonb', nullable: true })
  additionalContacts: IContactPerson[];

  @Column({ type: 'timestamp', nullable: true })
  lastInteraction: Date;

  @Column({ default: 0 })
  openTickets: number;

  @Column({ type: 'decimal', precision: 3, scale: 2, nullable: true })
  csat: number;

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