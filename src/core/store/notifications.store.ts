import { defineStore } from 'pinia';
import { ElNotification } from 'element-plus';
import { h } from 'vue';
import { useAuthStore } from '@/modules/auth/ui/store/auth.store';
// import { agendaServices } from '@/modules/calendar/data/calendar.services'; // Comentado temporariamente para o mock

export const useNotificationStore = defineStore('notifications', {
    state: () => ({
        notifications: [] as any[],
    }),
    getters: {
        unreadCount: (state) => state.notifications.filter(n => !n.read).length,
        unreadNotifications: (state) => state.notifications.filter(n => !n.read),
    },
    actions: {
        async checkTodayEvents() {
            try {
                const today = new Date().toISOString().substring(0, 10);

                // Mock atualizado com a propriedade "userId" para representar a quem pertence o agendamento
                const events = [
                    {
                        id: 101,
                        title: 'Reunião de Alinhamento',
                        client: 'Empresa XYZ',
                        time: '10:00',
                        date: today,
                        userId: '1'
                    },
                    {
                        id: 102,
                        title: 'Apresentação de Projeto',
                        client: 'João Silva',
                        time: '14:30',
                        date: today,
                        userId: '2'
                    },
                    {
                        id: 103,
                        title: 'Consulta de Rotina',
                        client: 'Maria Santos',
                        time: '09:00',
                        date: '2022-01-01',
                        userId: '1'
                    }
                ];

                const authStore = useAuthStore();
                const currentUser = authStore.user;

                const todayEvents = events.filter(e => {
                    const isToday = e.date === today;

                    if (currentUser?.role === 'ADMIN' || currentUser?.role === 'MANAGER') {
                        return isToday;
                    }

                    const matchesUser = e.userId === currentUser?.id || e.userId === currentUser?.email;

                    return isToday && matchesUser;
                });

                if (todayEvents.length > 0) {
                    todayEvents.forEach(evt => {
                        const exists = this.notifications.find(n => n.eventId === evt.id);
                        if (!exists) {
                            this.notifications.push({
                                id: Date.now() + Math.random(),
                                eventId: evt.id,
                                title: 'Lembrete de Agenda',
                                message: `${evt.time} - ${evt.title} com ${evt.client}`,
                                read: false,
                                time: evt.time
                            });
                        }
                    });

                    const storageKey = `lastNotificationDate_${currentUser?.email || 'default'}`;
                    const lastAlertDate = localStorage.getItem(storageKey);

                    if (lastAlertDate !== today) {
                        ElNotification({
                            title: 'Você tem compromissos hoje!',
                            message: h('div', { class: 'mt-2 text-slate-500 text-sm' }, [
                                `Você possui `,
                                h('strong', { class: 'text-blue-600 font-black' }, String(todayEvents.length)),
                                ` evento(s) agendado(s) para o dia de hoje. Não esqueça de verificar o sininho.`
                            ]),
                            type: 'warning',
                            position: 'top-right',
                            duration: 8000,
                            offset: 20
                        });

                        localStorage.setItem(storageKey, today);
                    }
                }
            } catch (error) {
                console.error("Erro ao carregar notificações de eventos:", error);
            }
        },
        markAsRead(id: number) {
            const notif = this.notifications.find((n: any) => n.id === id);
            if (notif) notif.read = true;
        },
        markAllAsRead() {
            this.notifications.forEach((n: any) => n.read = true);
        }
    }
});