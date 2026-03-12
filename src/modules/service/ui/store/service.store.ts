import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { IServiceItem } from '../../domain/entities/service.entity';

export const useServiceStore = defineStore('service', () => {
  const loading = ref(false);
  const noMoreData = ref(false);
  const page = ref(1);

  const services = ref<IServiceItem[]>([
    {
      id: '1',
      protocol: '20261012-0014',
      customerName: 'TechCorp Solutions',
      document: 'CNPJ: 12.345.678/0001-90',
      email: 'contato@techcorp.com.br',
      subject: 'Falha na emissão de NFe',
      lastAction: 'Aguardando retorno do setor fiscal',
      status: 'in_progress',
      priority: 'high',
      timeElapsed: '02:14:32',
      createdAt: '12/03/2026 às 08:30',
      history: [
        { date: '12/03/2026 10:44', title: 'Apontamento Interno', description: 'Repassado para o setor fiscal validar as alíquotas cadastradas no emissor.', author: 'João Silva (Atendente N2)', type: 'warning' },
        { date: '12/03/2026 09:15', title: 'Resposta ao Cliente', description: 'Solicitado envio do XML com erro para análise técnica.', author: 'Maria Souza (Atendente N1)', type: 'primary', attachment: 'log_erro_nfe.xml' },
        { date: '12/03/2026 08:30', title: 'Protocolo Gerado', description: 'Cliente relatou erro 403 ao tentar emitir nota fiscal de devolução.', author: 'Sistema', color: '#10b981' }
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
      status: 'waiting',
      priority: 'medium',
      timeElapsed: '00:45:10',
      createdAt: '12/03/2026 às 09:10',
      history: [
        { date: '12/03/2026 09:55', title: 'Mensagem Recebida', description: 'Onde encontro o filtro por filial no novo dashboard?', author: 'Cliente', type: 'info' },
        { date: '12/03/2026 09:10', title: 'Protocolo Gerado', description: 'Abertura via portal de autoatendimento.', author: 'Sistema', color: '#10b981' }
      ]
    }
  ]);

  const loadMoreServices = () => {
    if (loading.value || noMoreData.value) return;
    loading.value = true;

    setTimeout(() => {
      if (page.value >= 3) {
        noMoreData.value = true;
      } else {
        page.value++;
        services.value.push({
          id: Math.random().toString(),
          protocol: `20261011-00${page.value}0`,
          customerName: `Empresa Exemplo ${page.value} LTDA`,
          document: 'CNPJ: 00.000.000/0001-00',
          email: 'suporte@empresa.com',
          subject: 'Atualização de Sistema',
          lastAction: 'Finalizado pelo atendente',
          status: 'finished',
          priority: 'low',
          timeElapsed: '01:20:00',
          createdAt: '11/03/2026 às 14:00',
          history: [
            { date: '11/03/2026 15:20', title: 'Atendimento Concluído', description: 'Sistema atualizado com sucesso. Homologado pelo cliente.', author: 'Atendente N1', type: 'success' },
            { date: '11/03/2026 14:00', title: 'Protocolo Gerado', description: 'Solicitação de atualização de versão programada.', author: 'Sistema', color: '#10b981' }
          ]
        });
      }
      loading.value = false;
    }, 1000);
  };

  const finishService = (id: string, resolutionDetails: string) => {
    const service = services.value.find(s => s.id === id);
    if (service && service.status !== 'finished') {
      service.status = 'finished';
      service.lastAction = 'Atendimento finalizado';

      const now = new Date();
      const dataFormatada = `${now.toLocaleDateString('pt-PT')} ${now.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}`;

      service.history.unshift({
        date: dataFormatada,
        title: 'Atendimento Concluído',
        description: resolutionDetails,
        author: 'Você (Atendente)',
        type: 'success'
      });
    }
  };

  return { services, loading, noMoreData, loadMoreServices, finishService };
});