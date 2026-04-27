import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Tenant } from '../../../database/postgres/tenant.entity';

@Entity('role_templates')
export class RoleTemplate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50 })
  name: string;

  @Column({ type: 'boolean', default: false })
  isAdmin: boolean;

  @Column({ type: 'jsonb', default: {} })
  permissions: Record<string, { active: boolean; features: Record<string, boolean> }>;

  @Column({ type: 'varchar', length: 7, default: '#6366f1' })
  defaultColor: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}

@Entity('system_modules')
export class SystemModule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 100 })
  displayName: string;

  @Column({ type: 'integer', default: 0 })
  order: number;

  @Column({ type: 'boolean', default: true })
  active: boolean;

  @Column({ type: 'jsonb', default: [] })
  features: Array<{ key: string; displayName: string; order: number }>;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}