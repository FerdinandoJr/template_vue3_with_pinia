import { defineStore } from 'pinia';
import { ElNotification } from 'element-plus';
import { h } from 'vue';
import { useAuthStore } from '@/modules/auth/ui/store/auth.store';
import { notificationService } from '@/core/services/notification.service';

export interface INotification {
    id: number;
    eventId: number | string;
    title: string;
    message: string;
    read: boolean;
    time: string;
}

export const useNotificationStore = defineStore('notifications', {
    state: () => ({
        notifications: [] as INotification[],
    }),
    getters: {
        unreadCount: (state) => state.notifications.filter(n => !n.read).length,
        unreadNotifications: (state) => state.notifications.filter(n => !n.read),
    },
    actions: {
        async checkTodayEvents() {
            try {
                const today = new Date().toISOString().substring(0, 10);
                const authStore = useAuthStore();
                const currentUser = authStore.user;

                const events = await notificationService.getTodayEvents();
                const filteredEvents = notificationService.filterEventsByUser(
                    events,
                    currentUser?.id,
                    currentUser?.role
                );

                const todayEvents = filteredEvents.filter(e => e.date === today);

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

                    if (!notificationService.hasAlertForToday(currentUser?.email)) {
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

                        notificationService.markAlertAsSent(currentUser?.email);
                    }
                }
            } catch (error) {
                console.error("Erro ao carregar notificações de eventos:", error);
            }
        },
        markAsRead(id: number) {
            const notif = this.notifications.find(n => n.id === id);
            if (notif) notif.read = true;
        },
        markAllAsRead() {
            this.notifications.forEach(n => n.read = true);
        }
    }
});