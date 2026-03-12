import type { ICustomer } from "../domain/entities/customer"
import { CustomerStatus } from "../domain/valueObjects/customer-status.enum"

export interface CustomerFilter {
  query?: string;
  page?: number;
  limit?: number;
}

export interface Paginated<T> {
  total: number;
  filteredTotal: number;
  items: T[];
}

let mock: ICustomer[] = [
  { uuid: "1001", name: "Carlos Silva", companyName: "Tech Solutions Desenvolvimento de Software LTDA", tradeName: "Tech Solutions", document: "12.345.678/0001-90", website: "www.techsolutions.com.br", zipCode: "01310-100", street: "Avenida Paulista", number: "1000", complement: "Conjunto 42", neighborhood: "Bela Vista", city: "São Paulo", state: "SP", email: "carlos@tech.com", phone: "11999999999", avatar: 'TS', status: CustomerStatus.ACTIVE, source: 'WhatsApp', lastInteraction: new Date(), openTickets: 2, csat: 4.5, contacts: [] },
  { uuid: "1002", name: "Ana Oliveira", companyName: "Logística Nacional de Cargas S/A", tradeName: "Logística SA", document: "98.765.432/0001-10", website: "www.logisticasa.com", zipCode: "13010-001", street: "Rua das Indústrias", number: "500", complement: "Galpão 3", neighborhood: "Distrito Industrial", city: "Campinas", state: "SP", email: "ana@logistica.com", phone: "11988888888", avatar: 'LS', status: CustomerStatus.INACTIVE, source: 'Email', lastInteraction: new Date(new Date().setDate(new Date().getDate() - 5)), openTickets: 0, csat: 5.0, contacts: [] }
]

// Gerador automático de clientes para testar a paginação visualmente
for (let i = 3; i <= 27; i++) {
  mock.push({
    uuid: `100${i}`,
    name: `Cliente Teste ${i}`,
    companyName: `Empresa Comercial ${i} LTDA`,
    tradeName: `Comercial ${i}`,
    document: `00.000.000/0001-${i.toString().padStart(2, '0')}`,
    email: `contato${i}@empresa.com`,
    phone: `119777777${i.toString().padStart(2, '0')}`,
    avatar: `C${i}`,
    status: i % 3 === 0 ? CustomerStatus.INACTIVE : CustomerStatus.ACTIVE,
    source: 'Indicação',
    lastInteraction: new Date(),
    openTickets: i % 2,
    csat: 4.0,
  });
}

export const customerServices = {
  async list(filter: CustomerFilter): Promise<Paginated<ICustomer>> {
    return new Promise((resolve) => {
      setTimeout(() => {
        let filtered = [...mock];

        // 1. Aplica o filtro de busca
        if (filter.query) {
          const q = filter.query.toLowerCase();
          filtered = filtered.filter(c =>
            c.name.toLowerCase().includes(q) ||
            c.companyName.toLowerCase().includes(q) ||
            (c.tradeName && c.tradeName.toLowerCase().includes(q)) ||
            c.email.toLowerCase().includes(q)
          );
        }

        // 2. Aplicação da Paginação (Server-Side)
        const page = filter.page || 1;
        const limit = filter.limit || 10;
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;

        // Retorna apenas a "fatia" do banco de dados
        const paginatedItems = filtered.slice(startIndex, endIndex);

        resolve({
          total: mock.length,
          filteredTotal: filtered.length,
          items: paginatedItems
        })
      }, 300)
    })
  },

  async getById(uuid: string): Promise<ICustomer | undefined> {
    return new Promise(resolve => setTimeout(() => resolve(mock.find(item => item.uuid === uuid)), 200))
  },

  async create(data: Omit<ICustomer, 'uuid' | 'lastInteraction' | 'openTickets' | 'csat'>): Promise<ICustomer> {
    return new Promise(resolve => {
      setTimeout(() => {
        const newCustomer: ICustomer = {
          ...data,
          uuid: Math.random().toString(36).substring(2, 9),
          lastInteraction: new Date(),
          openTickets: 0,
          csat: 5.0,
        };
        mock.unshift(newCustomer);
        resolve(newCustomer);
      }, 400);
    });
  },

  async update(uuid: string, data: Partial<ICustomer>): Promise<ICustomer> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = mock.findIndex(c => c.uuid === uuid);
        if (index === -1) return reject(new Error("Cliente não encontrado"));

        const existingCustomer = mock[index] as ICustomer;
        const updatedCustomer: ICustomer = { ...existingCustomer, ...data } as ICustomer;
        mock[index] = updatedCustomer;
        resolve(updatedCustomer);
      }, 400);
    });
  },

  async delete(uuid: string): Promise<void> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = mock.findIndex(c => c.uuid === uuid);
        if (index === -1) return reject(new Error("Cliente não encontrado"));
        mock.splice(index, 1);
        resolve();
      }, 400);
    });
  }
}