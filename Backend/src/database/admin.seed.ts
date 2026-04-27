import { AppDataSource } from '../data-source';
import { User } from './postgres/user.entity';
import { Tenant } from './postgres/tenant.entity';
import * as bcrypt from 'bcrypt';

export async function seedAdminUser() {
  const userRepository = AppDataSource.getRepository(User);
  const tenantRepository = AppDataSource.getRepository(Tenant);
  
  const adminEmail = 'admin@datacompany.inf.br';
  const existingAdmin = await userRepository.findOne({ 
    where: { email: adminEmail } 
  });
  
  if (existingAdmin) {
    console.log('✅ Admin já existe');
    return;
  }
  
  const tenant = await tenantRepository.save({
    name: 'Datacompany',
    domain: 'datacompany.inf.br',
    isActive: true,
    settings: {},
  });
  
  const hashedPassword = await bcrypt.hash('Data@2026@data', 10);
  
  await userRepository.save({
    name: 'Datacompany',
    email: adminEmail,
    password: hashedPassword,
    isActive: true,
    emailVerified: true,
    tenantId: tenant.id,
  });
  
  console.log('✅ Tenant criado: Datacompany (datacompany.inf.br)');
  console.log('✅ Admin criado: admin@datacompany.inf.br');
}