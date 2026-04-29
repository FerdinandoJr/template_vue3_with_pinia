import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTicketAdvancedFields1715600000000 implements MigrationInterface {
  name = 'AddTicketAdvancedFields1715600000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE tickets 
      ADD COLUMN IF NOT EXISTS source VARCHAR(20) DEFAULT 'manual',
      ADD COLUMN IF NOT EXISTS internal_notes TEXT,
      ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMP,
      ADD COLUMN IF NOT EXISTS closed_at TIMESTAMP,
      ADD COLUMN IF NOT EXISTS first_response_at TIMESTAMP,
      ADD COLUMN IF NOT EXISTS sla_first_response TIMESTAMP,
      ADD COLUMN IF NOT EXISTS sla_deadline TIMESTAMP,
      ADD COLUMN IF NOT EXISTS actual_hours DECIMAL(10, 2),
      ADD COLUMN IF NOT EXISTS created_by UUID,
      ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status)
    `);
    
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_tickets_priority ON tickets(priority)
    `);
    
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_tickets_created ON tickets("createdAt")
    `);
    
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_tickets_sla_deadline ON tickets(sla_deadline)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS idx_tickets_sla_deadline`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_tickets_created`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_tickets_priority`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_tickets_status`);
    
    await queryRunner.query(`
      ALTER TABLE tickets 
      DROP COLUMN IF EXISTS source,
      DROP COLUMN IF EXISTS internal_notes,
      DROP COLUMN IF EXISTS resolved_at,
      DROP COLUMN IF EXISTS closed_at,
      DROP COLUMN IF EXISTS first_response_at,
      DROP COLUMN IF EXISTS sla_first_response,
      DROP COLUMN IF EXISTS sla_deadline,
      DROP COLUMN IF EXISTS actual_hours,
      DROP COLUMN IF EXISTS created_by,
      DROP COLUMN IF EXISTS deleted_at
    `);
  }
}