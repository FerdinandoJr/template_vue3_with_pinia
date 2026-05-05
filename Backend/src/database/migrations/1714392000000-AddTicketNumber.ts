import { MigrationInterface, QueryRunner, TableColumn, TableIndex } from 'typeorm';

export class AddTicketNumber1714392000000 {
  name = 'AddTicketNumber1714392000000';

  async up(queryRunner: QueryRunner): Promise<void> {
   
    await queryRunner.addColumn(
      'tickets',
      new TableColumn({
        name: 'ticketNumber',
        type: 'varchar',
        length: '20',
        isNullable: true,
      }),
    );

   
    await queryRunner.createIndex(
      'tickets',
      new TableIndex({
        name: 'idx_tickets_number',
        columnNames: ['tenantId', 'ticketNumber'],
        isUnique: false,
      }),
    );

   
    const tickets = await queryRunner.query(`
      SELECT id, "tenantId", "createdAt" 
      FROM tickets 
      ORDER BY "createdAt" ASC
    `);

    let counters: Record<string, number> = {};
    for (const ticket of tickets) {
      const tenantId = ticket.tenantId;
      if (!counters[tenantId]) {
        counters[tenantId] = 0;
      }
      counters[tenantId]++;
      const ticketNumber = `TKT-${String(counters[tenantId]).padStart(5, '0')}`;
      await queryRunner.query(
        `UPDATE tickets SET "ticketNumber" = $1 WHERE id = $2`,
        [ticketNumber, ticket.id],
      );
    }

   
    await queryRunner.changeColumn(
      'tickets',
      'ticketNumber',
      new TableColumn({
        name: 'ticketNumber',
        type: 'varchar',
        length: '20',
        isNullable: false,
      }),
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('tickets', 'idx_tickets_number');
    await queryRunner.dropColumn('tickets', 'ticketNumber');
  }
}