import { AppDataSource } from '../src/data-source';
import { v4 as uuidv4 } from 'uuid';

async function fixColumns() {
  try {
    await AppDataSource.initialize();
    console.log('✅ Connected to database');

    // Get board and its tenantId
    const boards = await AppDataSource.query('SELECT id, "tenantId" FROM kanban_boards LIMIT 1');
    if (!boards.length) {
      console.log('❌ No board found');
      return;
    }
    const board = boards[0];
    console.log('Board:', board);

    // Check if "Resolvido" column already exists
    const existing = await AppDataSource.query("SELECT id FROM kanban_columns WHERE title = 'Resolvido'");
    if (existing.length > 0) {
      console.log('✅ "Resolvido" column already exists');
      return;
    }

    // Add the missing "Resolvido" column
    await AppDataSource.query(`
      INSERT INTO kanban_columns (id, title, "order", color, "ticketStatus", "boardId", "tenantId")
      VALUES ($1, 'Resolvido', 4, '#10b981', 'resolved', $2, $3)
    `, [uuidv4(), board.id, board.tenantId]);

    console.log('✅ Added "Resolvido" column');

    // Update "Finalizado" order to 5
    await AppDataSource.query(`
      UPDATE kanban_columns SET "order" = 5 WHERE title = 'Finalizado'
    `);
    console.log('✅ Updated "Finalizado" order to 5');

    // List all columns
    const cols = await AppDataSource.query('SELECT "order", title, "ticketStatus" FROM kanban_columns ORDER BY "order"');
    console.log('\n📋 All columns:');
    cols.forEach((c: any) => console.log(`  ${c.order}. ${c.title} (${c.ticketStatus})`));

  } catch (error: any) {
    console.error('❌ Error:', error.message);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  }
}

fixColumns();
