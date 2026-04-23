import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('kb_articles')
@Index('idx_kb_articles_tenant', ['tenantId'])
@Index('idx_kb_articles_category', ['category'])
export class KbArticle {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  category: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  tags: string;

  @Column({ type: 'boolean', default: true })
  isPublished: boolean;

  @Column({ type: 'uuid', nullable: true })
  tenantId: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}