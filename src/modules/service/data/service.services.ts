import type { IServiceItem } from "../domain/entities/service.entity"
import { ServiceStatus, ServicePriority } from "../domain/valueObjects/service.enum"

export interface ServiceFilter {
  query?: string;
  status?: string;
  // Ampliamos a tipagem para evitar conflitos com o array que o Vue retorna
  dateRange?: string[] | [string, string] | null;
  page?: number;
  limit?: number;
}

export interface Paginated<T> {
  total: number;
  filteredTotal: number;
  items: T[];
}

let mock: IServiceItem[] = [
  {
    id: '1',
    protocol: '20261012-0014',
    customerName: 'TechCorp Solutions',
    document: 'CNPJ: 12.345.678/0001-90',
    email: 'contato@techcorp.com.br',
    subject: 'Falha na emissão de NFe',
    lastAction: 'Aguardando retorno do setor fiscal',
    status: ServiceStatus.IN_PROGRESS,
    priority: ServicePriority.HIGH,
    timeElapsed: '02:14:32',
    accumulatedTime: 8072000,
    lastResumedAt: Date.now(),
    description: 'Cliente relatou erro 403 ao tentar emitir nota fiscal de devolução. Precisa de atenção urgente.',
    createdAt: '12/03/2026 às 08:30',
    history: [
      { date: '12/03/2026 10:44', title: 'Apontamento Interno', description: 'Repassado para o setor fiscal validar as alíquotas.', author: 'João Silva', type: 'warning' },
      { date: '12/03/2026 09:15', title: 'Resposta ao Cliente', description: 'Solicitado envio do XML com erro para análise técnica.', author: 'Maria Souza', type: 'primary' },
      { date: '12/03/2026 08:30', title: 'Protocolo Gerado', description: 'Abertura de chamado pelo portal.', author: 'Sistema', color: '#10b981' }
    ]
  },
  {
    id: '2',
    protocol: '20261012-0088',
    customerName: 'Distribuidora Alvorada',
    document: 'CNPJ: 98.765.432/0001-10',
    email: 'financeiro@alvorada.com.br',
    subject: 'Dúvida sobre relatório de vendas',
    lastAction: 'Cliente enviou mensagem',
    status: ServiceStatus.WAITING,
    priority: ServicePriority.MEDIUM,
    timeElapsed: '00:45:10',
    accumulatedTime: 2710000,
    description: 'Onde encontro o filtro por filial no novo dashboard?',
    createdAt: '12/03/2026 às 09:10',
    history: [
      { date: '12/03/2026 09:55', title: 'Mensagem Recebida', description: 'Onde encontro o filtro por filial no novo dashboard?', author: 'Cliente', type: 'info' },
      { date: '12/03/2026 09:10', title: 'Protocolo Gerado', description: 'Abertura via portal de autoatendimento.', author: 'Sistema', color: '#10b981' }
    ]
  }
]

for (let i = 3; i <= 45; i++) {
  mock.push({
    id: i.toString(),
    protocol: `20261012-0${i.toString().padStart(3, '0')}`,
    customerName: `Empresa Parceira ${i} S/A`,
    document: `CNPJ: 00.000.000/0001-${i.toString().padStart(2, '0')}`,
    email: `contato${i}@empresa.com.br`,
    subject: i % 2 === 0 ? 'Dúvida no faturamento' : 'Instabilidade de conexão API',
    lastAction: 'Atualizado pelo sistema',
    status: i % 3 === 0 ? ServiceStatus.FINISHED : (i % 2 === 0 ? ServiceStatus.WAITING : ServiceStatus.IN_PROGRESS),
    priority: i % 4 === 0 ? ServicePriority.URGENT : (i % 2 === 0 ? ServicePriority.HIGH : ServicePriority.LOW),
    timeElapsed: '00:00:00',
    accumulatedTime: i * 150000,
    description: 'Descrição automática gerada para simular o chamado de número ' + i,
    createdAt: '12/03/2026 às 10:00',
    history: [
      { date: '12/03/2026 10:00', title: 'Protocolo Gerado', description: 'Abertura automática no sistema.', author: 'Sistema', color: '#10b981' }
    ]
  });
}

export const serviceServices = {
  async list(filter: ServiceFilter): Promise<Paginated<IServiceItem>> {
    return new Promise((resolve) => {
      setTimeout(() => {
        let filtered = [...mock];

        if (filter.status && filter.status !== 'all') {
          filtered = filtered.filter(s => s.status === filter.status);
        }

        if (filter.query) {
          const q = filter.query.toLowerCase();
          filtered = filtered.filter(s =>
            s.protocol.toLowerCase().includes(q) ||
            s.customerName.toLowerCase().includes(q) ||
            s.subject.toLowerCase().includes(q)
          );
        }

        // =======================================================
        // Filtro de Data corrigido para satisfazer o TypeScript
        // =======================================================
        if (filter.dateRange && filter.dateRange[0] && filter.dateRange[1]) {
          // Garantimos ao TS que estas posições são strings
          const startStr = filter.dateRange[0] as string;
          const endStr = filter.dateRange[1] as string;

          const parseDate = (dateStr: string) => {
            if (!dateStr) return 0;
            const [day, month, year] = dateStr.split('/');
            return new Date(Number(year), Number(month) - 1, Number(day)).getTime();
          };

          const startTime = parseDate(startStr);
          const endTime = parseDate(endStr) + 86399999; // + 1 dia (23:59:59)

          filtered = filtered.filter(s => {
            if (!s.createdAt) return false;

            const datePart = s.createdAt.split(' ')[0];
            if (!datePart) return false;

            const itemTime = parseDate(datePart as string);
            return itemTime >= startTime && itemTime <= endTime;
          });
        }
        // =======================================================

        const page = filter.page || 1;
        const limit = filter.limit || 10;
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;

        const paginatedItems = filtered.slice(startIndex, endIndex);

        resolve({
          total: mock.length,
          filteredTotal: filtered.length,
          items: paginatedItems
        });
      }, 300);
    });
  },

  async updateStatus(id: string, newStatus: string, resolutionDetails?: string): Promise<IServiceItem> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const service = mock.find(s => s.id === id);
        if (!service) return reject(new Error("Atendimento não encontrado"));

        service.status = newStatus;

        if (newStatus === ServiceStatus.FINISHED) {
          service.lastAction = 'Atendimento finalizado';
          service.history.unshift({
            date: new Date().toLocaleString('pt-BR'),
            title: 'Atendimento Concluído',
            description: resolutionDetails || 'Encerrado pelo atendente',
            author: 'Você (Atendente)',
            type: 'success'
          });
        } else if (newStatus === ServiceStatus.IN_PROGRESS) {
          service.lastResumedAt = Date.now();
        } else if (newStatus === ServiceStatus.PAUSED) {
          if (service.lastResumedAt) {
            service.accumulatedTime = (service.accumulatedTime || 0) + (Date.now() - service.lastResumedAt);
            service.lastResumedAt = undefined;
          }
        }

        resolve(service);
      }, 400);
    });
  }
}