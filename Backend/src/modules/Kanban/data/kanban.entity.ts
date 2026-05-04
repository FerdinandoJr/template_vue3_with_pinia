import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Tenant } from '../../../database/postgres/tenant.entity';

@Entity('kanban_boards')
@Index('idx_kanban_boards_tenant', ['tenantId'])
export class KanbanBoard {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'integer', default: 0 })
  order: number;

  @Column({ type: 'varchar', length: 7, nullable: true })
  color: string;

  @Column({ type: 'integer', nullable: true })
  wipLimit: number;

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

@Entity('kanban_columns')
@Index('idx_kanban_columns_board', ['boardId'])
export class KanbanColumn {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'integer', default: 0 })
  order: number;

  @Column({ type: 'varchar', length: 7, nullable: true })
  color: string;

  @Column({ type: 'integer', nullable: true })
  wipLimit: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  ticketStatus: string;

  @Column({ type: 'uuid', nullable: true })
  boardId: string;

  @ManyToOne(() => KanbanBoard, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'boardId' })
  board: KanbanBoard;

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

@Entity('kanban_cards')
@Index('idx_kanban_cards_column', ['columnId'])
@Index('idx_kanban_cards_column_order', ['columnId', 'order'])
export class KanbanCard {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'uuid', nullable: true })
  columnId: string;

  @Column({ type: 'uuid', nullable: true })
  boardId: string;

  @ManyToOne(() => KanbanColumn, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'columnId' })
  column: KanbanColumn;

  @Column({ type: 'uuid', nullable: true })
  ticketId: string;

  @Column({ type: 'integer', default: 0 })
  order: number;

  @Column({ type: 'uuid', nullable: true })
  tenantId: string;

  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenantId' })
  tenant: Tenant;

  @Column({ type: 'varchar', length: 20, nullable: true })
  priority: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  type: string;

  @Column({ type: 'uuid', nullable: true })
  customerId: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  ticketNumber: string;

  @Column({ type: 'simple-array', nullable: true })
  assignees: string[];

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  estimatedHours: number;

  @Column({ type: 'jsonb', nullable: true })
  tags: any[];

  @Column({ type: 'jsonb', nullable: true })
  checklist: any[];

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
