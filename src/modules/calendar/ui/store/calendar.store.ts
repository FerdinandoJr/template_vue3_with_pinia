import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useCalendarStore = defineStore('calendar', () => {
  const allEvents = ref<any[]>([
    {
      id: '1', title: 'Consulta Inicial - Maria Silva', date: '2025-02-18', time: '09:00', endTime: '10:00',
      userId: '1', isRecurring: false, patientName: 'Maria Silva', status: 'confirmed'
    },
    {
      id: '2', title: 'Revisão Contratual - João Santos', date: '2025-02-19', time: '14:00', endTime: '15:30',
      userId: '2', isRecurring: false, patientName: 'João Santos', status: 'pending'
    },
    {
      id: '3', title: 'Reunião de Equipe', date: '2025-02-20', time: '16:00', endTime: '17:00',
      userId: '3', isRecurring: true, recurrenceType: 'weekly', recurrenceDays: [4], recurrenceEndDate: '2025-12-31', status: 'confirmed'
    }
  ]);

  const availableUsers = ref([
    { id: '1', name: 'Você', theme: { primary: '#3b82f6', light: '#eff6ff', dark: '#1e40af' }, avatar: 'https://ui-avatars.com/api/?name=Você' },
    { id: '2', name: 'Atendente Alpha', theme: { primary: '#10b981', light: '#ecfdf5', dark: '#065f46' }, avatar: 'https://ui-avatars.com/api/?name=Alpha' },
    { id: '3', name: 'Gestor', theme: { primary: '#8b5cf6', light: '#f5f3ff', dark: '#5b21b6' }, avatar: 'https://ui-avatars.com/api/?name=Gestor' }
  ]);

  const selectedUserIds = ref<string[]>(['1']);
  const selectedDate = ref(new Date());

  // NOVA VARIÁVEL ADICIONADA: Dias fechados (pode ser um array de números [0, 6] para fins de semana ou strings 'YYYY-MM-DD')
  const closedDays = ref<any[]>([]);

  const filteredEvents = computed(() => {
    if (!selectedUserIds.value || selectedUserIds.value.length === 0) return [];
    return allEvents.value.filter(event => selectedUserIds.value.includes(event.userId));
  });

  const fetchAgendaData = async () => { };

  const addEvent = (event: any) => {
    if (!event.id) event.id = 'evt-' + Date.now().toString();
    allEvents.value.push(event);
  };

  const updateEvent = (event: any) => {
    const index = allEvents.value.findIndex(e => e.id === event.id);
    if (index !== -1) allEvents.value[index] = event;
  };

  const deleteEvent = (id: string) => {
    allEvents.value = allEvents.value.filter(e => e.id !== id);
  };

  const setSelectedDate = (date: Date) => {
    selectedDate.value = date;
  };

  return {
    allEvents, availableUsers, selectedUserIds, selectedDate, filteredEvents, closedDays,
    fetchAgendaData, addEvent, updateEvent, deleteEvent, setSelectedDate
  };
});