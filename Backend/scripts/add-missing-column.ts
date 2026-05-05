import { AppDataSource } from '../src/data-source';
import { KanbanColumn } from '../src/modules/Kanban/data/kanban.entity';
import { KanbanBoard } from '../src/modules/Kanban/data/kanban.entity';

async function addColumn() {
  try {
    await AppDataSource.initialize();
    console.log('✅ Connected to database');

    const colRepo = AppDataSource.getRepository(KanbanColumn);
    const boardRepo = AppDataSource.getRepository(KanbanBoard);

    // Check if "Resolvido" column already exists
    const existing = await colRepo.findOne({ where: { title: 'Resolvido' } });
    if (existing) {
      console.log('✅ "Resolvido" column already exists');
      return;
    }

    // Get the board and its tenantId
    const board = await boardRepo.findOne({ where: { id: '803e6e10-d6ef-43b9-bcbf-20fddcd3dd7b' } });
    if (!board) {
      console.log('❌ Board not found');
      return;
    }

    const boardId = board.id;
    const tenantId = board.tenantId; // Use the board's tenantId

    console.log(`Board tenantId: ${tenantId}`);

    // Add the missing "Resolvido" column
    const col = colRepo.create({
      title: 'Resolvido',
      order: 4,
      color: '#10b981',
      boardId: boardId,
      tenantId: tenantId,
      ticketStatus: 'resolved'
    });

    await colRepo.save(col);
    console.log('✅ Added "Resolvido" column');

    // Update "Finalizado" order to 5
    const finalizado = await colRepo.findOne({ where: { title: 'Finalizado' } });
    if (finalizado) {
      finalizado.order = 5;
      await colRepo.save(finalizado);
      console.log('✅ Updated "Finalizado" order to 5');
    }

    // List all columns
    const allCols = await colRepo.find({ where: { boardId }, order: { order: 'ASC' } });
    console.log('\n📋 All columns:');
    allCols.forEach(c => console.log(`  ${c.order}. ${c.title} (${c.ticketStatus})`));

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  }
}

addColumn();
