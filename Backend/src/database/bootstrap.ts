import { AppDataSource } from '../data-source';
import { seedAdminUser } from './admin.seed';

export async function bootstrapDatabase() {
  try {
    console.log('🔌 Conectando ao banco de dados...');
    await AppDataSource.initialize();
    console.log('✅ Conexão estabelecida');

    if (AppDataSource.options.synchronize) {
      console.log('🔄 Sincronizando schema do banco de dados...');
      await AppDataSource.synchronize();
      console.log('✅ Schema sincronizado');
    }
    
    await seedAdminUser();
  } catch (error) {
    console.error('❌ Erro ao conectar no banco de dados:', error);
    throw error;
  }
}