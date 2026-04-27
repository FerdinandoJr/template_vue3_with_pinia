import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Tenant } from '../../../database/postgres/tenant.entity';

@Entity('roles')
@Index('idx_roles_tenant', ['tenantId'])
export class Role {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 7, default: '#6366f1' })
  color: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'boolean', default: false })
  isAdmin: boolean;

  @Column({ type: 'integer', default: 0 })
  order: number;

  @Column({ type: 'jsonb', default: {} })
  permissions: Record<string, { active: boolean; features: Record<string, boolean> }>;

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

@Entity('user_roles')
@Index('idx_user_roles_user', ['userId'])
@Index('idx_user_roles_role', ['roleId'])
export class UserRoleAssignment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'uuid' })
  roleId: string;

  @Column({ type: 'uuid', nullable: true })
  tenantId: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;
}