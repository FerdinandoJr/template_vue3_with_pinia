import type { ICustomer } from "../domain/entities/customer"
import { CustomerStatus } from "../domain/valueObjects/customer-status.enum"

export interface CustomerFilter {
  query?: string;
}

export interface Paginated<T> {
  total: number
  filteredTotal: number
  items: T[]
}

let mock: ICustomer[] = [
  {
    uuid: "1001",
    name: "Carlos Silva",
    companyName: "Tech Solutions Desenvolvimento de Software LTDA", // Razão Social
    tradeName: "Tech Solutions", // Nome Fantasia
    document: "12.345.678/0001-90",
    website: "www.techsolutions.com.br",

    zipCode: "01310-100",
    street: "Avenida Paulista",
    number: "1000",
    complement: "Conjunto 42",
    neighborhood: "Bela Vista",
    city: "São Paulo",
    state: "SP",

    email: "carlos@tech.com",
    phone: "11999999999",
    avatar: 'TS',
    status: CustomerStatus.ACTIVE,
    source: 'WhatsApp',
    lastInteraction: new Date(),
    openTickets: 2,
    csat: 4.5,
    contacts: []
  },
  {
    uuid: "1002",
    name: "Ana Oliveira",
    companyName: "Logística Nacional de Cargas S/A",
    tradeName: "Logística SA",
    document: "98.765.432/0001-10",
    website: "www.logisticasa.com",

    zipCode: "13010-001",
    street: "Rua das Indústrias",
    number: "500",
    complement: "Galpão 3",
    neighborhood: "Distrito Industrial",
    city: "Campinas",
    state: "SP",

    email: "ana@logistica.com",
    phone: "11988888888",
    avatar: 'LS',
    status: CustomerStatus.INACTIVE,
    source: 'Email',
    lastInteraction: new Date(new Date().setDate(new Date().getDate() - 5)),
    openTickets: 0,
    csat: 5.0,
    contacts: []
  }
]

export const customerServices = {
  async list(filter: CustomerFilter): Promise<Paginated<ICustomer>> {
    return new Promise((resolve) => {
      setTimeout(() => {
        let filtered = [...mock];
        if (filter.query) {
          const q = filter.query.toLowerCase();
          filtered = filtered.filter(c =>
            c.name.toLowerCase().includes(q) ||
            c.companyName.toLowerCase().includes(q) ||
            (c.tradeName && c.tradeName.toLowerCase().includes(q)) || // Pesquisa por Nome Fantasia também
            c.email.toLowerCase().includes(q)
          );
        }
        resolve({
          total: mock.length,
          filteredTotal: filtered.length,
          items: filtered
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
          uuid: Math.random().toString(36).substr(2, 9),
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