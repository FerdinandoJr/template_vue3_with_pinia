import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Tenant } from '../../../database/postgres/tenant.entity';
import { User } from '../../../database/postgres/user.entity';
import { Customer } from '../../Customer/data/customer.entity';

export enum ChatStatus {
  OPEN = 'open',
  CLOSED = 'closed',
}

@Entity('chats')
@Index('idx_chats_tenant', ['tenantId'])
@Index('idx_chats_customer', ['customerId'])
@Index('idx_chats_agent', ['agentId'])
export class Chat {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: true })
  customerId: string;

  @ManyToOne(() => Customer, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'customerId' })
  customer: Customer;

  @Column({ type: 'uuid', nullable: true })
  agentId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'agentId' })
  agent: User;

  @Column({ type: 'enum', enum: ChatStatus, default: ChatStatus.OPEN })
  status: ChatStatus;

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

@Entity('chat_messages')
@Index('idx_chat_messages_chat', ['chatId'])
export class ChatMessage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  chatId: string;

  @ManyToOne(() => Chat, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'chatId' })
  chat: Chat;

  @Column({ type: 'uuid' })
  senderId: string;

  @Column({ type: 'varchar', length: 20 })
  senderType: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ type: 'boolean', default: false })
  isRead: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;
}