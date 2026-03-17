<template>
    <div class="h-full w-full bg-white relative">
        <FullCalendar ref="fullCalendarRef" :options="calendarOptions" class="h-full w-full custom-calendar" />
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import FullCalendar from '@fullcalendar/vue3';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import ptBrLocale from '@fullcalendar/core/locales/pt-br';
import { useCalendarStore } from '../store/calendar.store';

const props = defineProps<{ currentView: string }>();
const emit = defineEmits(['dates-set', 'create-event', 'edit-event', 'update-event-date']);

const store = useCalendarStore();
const fullCalendarRef = ref<any>(null);

const getApi = () => fullCalendarRef.value?.getApi();
defineExpose({ getApi });

watch(() => props.currentView, (newView) => {
    const api = getApi();
    if (api) api.changeView(newView);
});

const calendarOptions = computed(() => ({
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin],
    initialView: props.currentView,
    locale: ptBrLocale,
    headerToolbar: false as const,
    editable: true,
    selectable: true,
    selectMirror: true,
    dayMaxEvents: true,
    allDaySlot: false,
    slotMinTime: '06:00:00',
    slotMaxTime: '23:00:00',
    height: '100%',
    noEventsText: 'Nenhum agendamento para este período.',

    slotLabelFormat: { hour: '2-digit' as const, minute: '2-digit' as const, omitZeroMinute: false, hour12: false },
    eventTimeFormat: { hour: '2-digit' as const, minute: '2-digit' as const, omitZeroMinute: false, hour12: false },

    events: store.filteredEvents.flatMap((e: any): any[] => {
        const user = store.availableUsers.find(u => u.id === e.userId);
        const theme = user?.theme || { primary: '#3b82f6', light: '#eff6ff', dark: '#1e40af' };

        const eventBgColor = e.color ? e.color : theme.light;
        const eventBorderColor = e.color ? e.color : theme.primary;
        const eventTextColor = e.color ? '#ffffff' : theme.dark;

        // AQUI IDENTIFICAMOS SE É UM BLOQUEIO DE AGENDA
        const baseEvent = {
            id: e.id,
            title: e.isBlocker ? `🔒 ${e.title}` : e.title,
            backgroundColor: e.isBlocker ? '#f8fafc' : eventBgColor,
            borderColor: e.isBlocker ? '#94a3b8' : eventBorderColor,
            textColor: e.isBlocker ? '#475569' : eventTextColor,
            classNames: e.isBlocker ? ['is-blocked-slot'] : [],
            extendedProps: { ...e, theme }
        };

        if (e.isRecurring) {
            if (e.recurrenceType === 'monthly') {
                const monthlyEvents: any[] = [];
                let currentDate = new Date(`${e.date}T12:00:00`);
                const endLimitDate = e.recurrenceEndDate
                    ? new Date(`${e.recurrenceEndDate}T23:59:59`)
                    : new Date(currentDate.getFullYear() + 2, currentDate.getMonth(), currentDate.getDate());

                while (currentDate <= endLimitDate) {
                    const dStr = currentDate.toISOString().split('T')[0];
                    monthlyEvents.push({
                        ...baseEvent, id: `${e.id}-${dStr}`, start: `${dStr}T${e.time}:00`, end: `${dStr}T${e.endTime}:00`,
                    });
                    currentDate.setMonth(currentDate.getMonth() + 1);
                }
                return monthlyEvents;
            } else {
                let daysOfWeek: number[] = [];
                if (e.recurrenceType === 'daily') daysOfWeek = [0, 1, 2, 3, 4, 5, 6];
                else if (e.recurrenceType === 'weekly' && e.recurrenceDays?.length) daysOfWeek = e.recurrenceDays;

                return [{
                    ...baseEvent, startTime: e.time + ':00', endTime: e.endTime + ':00', startRecur: e.date,
                    endRecur: e.recurrenceEndDate ? `${e.recurrenceEndDate}T23:59:59` : undefined,
                    daysOfWeek: daysOfWeek.length > 0 ? daysOfWeek : undefined,
                }];
            }
        } else {
            return [{ ...baseEvent, start: `${e.date}T${e.time}:00`, end: `${e.date}T${e.endTime}:00` }];
        }
    }),

    select: (info: any) => emit('create-event', info.startStr),
    eventClick: (info: any) => emit('edit-event', info.event.extendedProps),
    eventDrop: (info: any) => handleEventDropOrResize(info.event),
    eventResize: (info: any) => handleEventDropOrResize(info.event),
    datesSet: (info: any) => emit('dates-set', info.view.title)
}));

const handleEventDropOrResize = (calendarEvent: any) => {
    const e = calendarEvent.extendedProps;
    const start = calendarEvent.start;
    const end = calendarEvent.end || calendarEvent.start;
    emit('update-event-date', { ...e, date: start.toISOString().split('T')[0], time: start.toTimeString().substring(0, 5), endTime: end.toTimeString().substring(0, 5) });
};
</script>

<style>
/* CSS liberado do "scoped" para forçar o estilo no FullCalendar */
.custom-calendar .fc-event {
    cursor: pointer !important;
    border-radius: 4px !important;
    border-left-width: 4px !important;
    border-top: none !important;
    border-right: none !important;
    border-bottom: none !important;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05) !important;
    padding: 2px 4px !important;
    font-weight: 600 !important;
}

.custom-calendar .fc-event:hover {
    transform: translateY(-1px) !important;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.08) !important;
}

/* 🔒 CSS MÁGICO PARA EVENTOS BLOQUEADOS 🔒 */
.custom-calendar .is-blocked-slot {
    background: repeating-linear-gradient(45deg,
            #f8fafc,
            #f8fafc 8px,
            #f1f5f9 8px,
            #f1f5f9 16px) !important;
    border-left: 4px solid #94a3b8 !important;
    border: 1px dashed #94a3b8 !important;
    color: #475569 !important;
    opacity: 0.8 !important;
}

.custom-calendar .is-blocked-slot:hover {
    opacity: 1 !important;
    background: repeating-linear-gradient(45deg,
            #f1f5f9,
            #f1f5f9 8px,
            #e2e8f0 8px,
            #e2e8f0 16px) !important;
}

.custom-calendar .is-blocked-slot .fc-event-title {
    font-weight: 800 !important;
    font-style: italic !important;
    letter-spacing: 0.03em;
}

.custom-calendar .fc-daygrid-event-dot {
    display: none !important;
}

.custom-calendar .fc-col-header-cell {
    padding: 12px 0 !important;
    background-color: #f8fafc !important;
    color: #475569 !important;
    font-weight: 700 !important;
    text-transform: uppercase !important;
    font-size: 0.75rem !important;
    border-bottom: 1px solid #e2e8f0 !important;
}

.custom-calendar .fc-list-day-cushion {
    background-color: #f8fafc !important;
    padding: 12px 16px !important;
    font-weight: 800 !important;
    color: #334155 !important;
    text-transform: capitalize !important;
}

.custom-calendar .fc-list-event:hover td {
    background-color: #f1f5f9 !important;
}

.custom-calendar .fc-list-event-time {
    font-weight: 700 !important;
    color: #475569 !important;
}

.custom-calendar .fc-list-event-dot {
    border-color: currentColor !important;
    border-width: 4px !important;
}
</style>