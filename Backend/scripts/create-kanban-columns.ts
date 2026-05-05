import { AppDataSource } from '../src/data-source';
import { KanbanBoard, KanbanColumn } from '../src/modules/Kanban/data/kanban.entity';

async function createColumns() {
  try {
    await AppDataSource.initialize();
    console.log('✅ Connected to database');

    const boardRepo = AppDataSource.getRepository(KanbanBoard);
    const colRepo = AppDataSource.getRepository(KanbanColumn);

    let board = await boardRepo.findOne({ where: {} });

    if (!board) {
      console.log('Creating new board...');
      board = boardRepo.create({
        title: 'Quadro Principal',
        tenantId: 'central_atendimento'
      });
      board = await boardRepo.save(board);
      console.log('✅ Board created:', board.id);
    } else {
      console.log('✅ Board exists:', board.id);
    }

    const existingCols = await colRepo.find({ where: { boardId: board.id } });
    if (existingCols.length > 0) {
      console.log('⚠️ Columns already exist:', existingCols.length);
      existingCols.forEach(c => console.log(`  - ${c.title}`));
      return;
    }

    console.log('Creating columns...');
    const columns = [
      { title: 'Pendente', order: 0, color: '#ef4444', boardId: board.id, tenantId: 'central_atendimento', ticketStatus: 'open' },
      { title: 'A Fazer', order: 1, color: '#f59e0b', boardId: board.id, tenantId: 'central_atendimento', ticketStatus: 'in_progress' },
      { title: 'Análise', order: 2, color: '#3b82f6', boardId: board.id, tenantId: 'central_atendimento', ticketStatus: 'waiting' },
      { title: 'Desenvolvimento', order: 3, color: '#8b5cf6', boardId: board.id, tenantId: 'central_atendimento', ticketStatus: 'in_progress' },
      { title: 'Resolvido', order: 4, color: '#10b981', boardId: board.id, tenantId: 'central_atendimento', ticketStatus: 'resolved' },
      { title: 'Finalizado', order: 5, color: '#22c55e', boardId: board.id, tenantId: 'central_atendimento', ticketStatus: 'closed' },
    ];

    for (const colData of columns) {
      const col = colRepo.create(colData);
      await colRepo.save(col);
      console.log(`✅ Created: ${colData.title}`);
    }

    console.log('✅ All columns created successfully!');
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  }
}

createColumns();
