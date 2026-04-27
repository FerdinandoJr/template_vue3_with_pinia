import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { agendaServices } from '../../data/calendar.services';
import { useAuthStore } from '@/modules/auth/ui/store/auth.store';
import { httpClient } from '@/core/infra/HttpClient';

export const useCalendarStore = defineStore('calendar', () => {
  const allEvents = ref<any[]>([]);
  const availableUsers = ref<any[]>([]);
  const selectedUserIds = ref<string[]>([]);
  const selectedDate = ref(new Date());
  const closedDays = ref<any[]>([]);
  const loading = ref(false);

  const filteredEvents = computed(() => {
    if (!selectedUserIds.value || selectedUserIds.value.length === 0) return allEvents.value;
    return allEvents.value.filter(event => !event.userId || selectedUserIds.value.includes(event.userId));
  });

  const fetchAgendaData = async () => {
    loading.value = true;
    try {
      const authStore = useAuthStore();
      console.log('[fetchAgendaData] authStore.user:', authStore.user);
      const events = await agendaServices.getEvents();
      console.log('[fetchAgendaData] events loaded:', events.length);
      allEvents.value = events || [];

      try {
        const response = await httpClient.get<any>('/users');
        const users = response?.data?.data || response?.data || [];
        if (users.length > 0) {
          availableUsers.value = users;
        } else {
          availableUsers.value = [{ id: authStore.user?.id, name: authStore.user?.name }];
        }
      } catch (err) {
        console.error('Erro ao buscar usuários da empresa:', err);
        availableUsers.value = [{ id: authStore.user?.id, name: authStore.user?.name }];
      }

      const userId = authStore.user?.id || availableUsers.value[0]?.id;
      selectedUserIds.value = userId ? [userId] : [];
    } catch (error) {
      console.error('Erro ao carregar agenda:', error);
    } finally {
      loading.value = false;
    }
  };

  const addEvent = async (event: any) => {
    loading.value = true;
    try {
      const created = await agendaServices.createEvent(event);
      allEvents.value.push(created);

      if (created.userId && !selectedUserIds.value.includes(created.userId)) {
        selectedUserIds.value.push(created.userId);
      }
    } catch (error) {
      console.error('Erro ao adicionar evento:', error);
    } finally {
      loading.value = false;
    }
  };

  const updateEvent = async (event: any) => {
    loading.value = true;
    try {
      const updated = await agendaServices.updateEvent(event.id, event);
      const index = allEvents.value.findIndex(e => e.id === event.id);
      if (index !== -1) allEvents.value[index] = updated;

      if (updated.userId && !selectedUserIds.value.includes(updated.userId)) {
        selectedUserIds.value.push(updated.userId);
      }
    } catch (error) {
      console.error('Erro ao atualizar evento:', error);
    } finally {
      loading.value = false;
    }
  };

  const deleteEvent = async (id: string) => {
    loading.value = true;
    try {
      await agendaServices.deleteEvent(id);
      allEvents.value = allEvents.value.filter(e => e.id !== id);
    } catch (error) {
      console.error('Erro ao excluir evento:', error);
    } finally {
      loading.value = false;
    }
  };

  const setSelectedDate = (date: Date) => {
    selectedDate.value = date;
  };

  return {
    allEvents, availableUsers, selectedUserIds, selectedDate, filteredEvents, closedDays, loading,
    fetchAgendaData, addEvent, updateEvent, deleteEvent, setSelectedDate
  };
});