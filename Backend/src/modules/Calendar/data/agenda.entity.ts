import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum AgendaType {
  MEETING = 'meeting',
  CALL = 'call',
  TASK = 'task',
  REMINDER = 'reminder',
}

@Entity('agenda')
export class Agenda {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'enum', enum: AgendaType, default: AgendaType.MEETING })
  type: AgendaType;

  @Column({ type: 'timestamp' })
  startDate: Date;

  @Column({ type: 'timestamp' })
  endDate: Date;

  @Column({ nullable: true })
  customerId: string;

  @Column({ nullable: true })
  assignedTo: string;

  @Column({ nullable: true })
  tenantId: string;

  @Column({ default: false })
  allDay: boolean;

  @Column({ nullable: true })
  color: string;

  @Column({ nullable: true })
  cep: string;

  @Column({ nullable: true })
  address: string;

  @Column({ type: 'text', nullable: true })
  postMeetingNotes: string;

  @Column({ default: false })
  isRecurring: boolean;

  @Column({ nullable: true })
  recurrenceType: string;

  @Column('simple-json', { nullable: true })
  recurrenceDays: number[];

  @Column({ type: 'timestamp', nullable: true })
  recurrenceEndDate: Date;

  @Column({ default: false })
  isBlocker: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}