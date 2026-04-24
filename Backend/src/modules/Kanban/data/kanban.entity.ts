import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Tenant } from '../../../database/postgres/tenant.entity';

@Entity('kanban_boards')
@Index('idx_kanban_boards_tenant', ['tenantId'])
export class KanbanBoard {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

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
@Index('idx_kanban_columns_tenant', ['tenantId'])
@Index('idx_kanban_columns_board_order', ['boardId', 'order'])
export class KanbanColumn {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'integer', default: 0 })
  order: number;

  @Column({ type: 'varchar', length: 7, nullable: true })
  color: string;

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

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}