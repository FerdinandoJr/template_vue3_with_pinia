import { AppDataSource } from '../../data-source';
import { CustomerSource } from '../../modules/Customer/data/customer-source.entity';

const defaultSources = [
  'WhatsApp',
  'Site / Landing Page',
  'Indicação',
  'Instagram',
  'Facebook',
  'Google',
  'Outro',
];

export async function seedCustomerSources(tenantId: string) {
  const repository = AppDataSource.getRepository(CustomerSource);

  const existing = await repository.find({ where: { tenantId } });
  if (existing.length > 0) {
    console.log('Origens de clientes já existem para tenant:', tenantId);
    return;
  }

  for (const name of defaultSources) {
    const source = repository.create({ name, tenantId });
    await repository.save(source);
  }

  console.log('Origens de clientes criadas para tenant:', tenantId);
}