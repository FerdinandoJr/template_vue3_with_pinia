import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useCalendarStore = defineStore('calendar', () => {
  const allEvents = ref<any[]>([]);

  // Utilizadores com cores definidas para identificar os eventos visualmente
  const availableUsers = ref([
    { id: '1', name: 'Você', color: '#2563eb', avatar: 'https://ui-avatars.com/api/?name=Você' },
    { id: '2', name: 'Atendente Alpha', color: '#10b981', avatar: 'https://ui-avatars.com/api/?name=Alpha' },
    { id: '3', name: 'Gestor', color: '#8b5cf6', avatar: 'https://ui-avatars.com/api/?name=Gestor' }
  ]);

  // CORREÇÃO: Inicia com todos os IDs marcados por padrão
  const selectedUserIds = ref<string[]>(['1', '2', '3']);
  const selectedDate = ref(new Date());

  // Computa apenas os eventos dos utilizadores selecionados na barra lateral
  const filteredEvents = computed(() => {
    if (!selectedUserIds.value || selectedUserIds.value.length === 0) return [];
    return allEvents.value.filter(event => selectedUserIds.value.includes(event.userId));
  });

  const fetchAgendaData = async () => {
    // Aqui virá a requisição real no futuro
  };

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
    allEvents,
    availableUsers,
    selectedUserIds,
    selectedDate,
    filteredEvents,
    fetchAgendaData,
    addEvent,
    updateEvent,
    deleteEvent,
    setSelectedDate
  };
});