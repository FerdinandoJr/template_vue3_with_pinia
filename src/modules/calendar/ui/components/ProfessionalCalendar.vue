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
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
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

    // --- CORREÇÃO: Usando "as const" para satisfazer a tipagem estrita do TypeScript ---
    slotLabelFormat: {
        hour: '2-digit' as const,
        minute: '2-digit' as const,
        omitZeroMinute: false,
        hour12: false
    },
    eventTimeFormat: {
        hour: '2-digit' as const,
        minute: '2-digit' as const,
        omitZeroMinute: false,
        hour12: false
    },

    events: store.filteredEvents.flatMap((e: any): any[] => {
        const user = store.availableUsers.find(u => u.id === e.userId);
        const bgColor = user ? user.color : '#3b82f6';

        const baseEvent = {
            id: e.id,
            title: e.title,
            backgroundColor: bgColor,
            borderColor: bgColor,
            textColor: '#ffffff',
            extendedProps: { ...e }
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
                        ...baseEvent,
                        id: `${e.id}-${dStr}`,
                        start: `${dStr}T${e.time}:00`,
                        end: `${dStr}T${e.endTime}:00`,
                    });
                    currentDate.setMonth(currentDate.getMonth() + 1);
                }
                return monthlyEvents;
            } else {
                let daysOfWeek: number[] = [];
                if (e.recurrenceType === 'daily') daysOfWeek = [0, 1, 2, 3, 4, 5, 6];
                else if (e.recurrenceType === 'weekly' && e.recurrenceDays?.length) daysOfWeek = e.recurrenceDays;

                return [{
                    ...baseEvent,
                    startTime: e.time + ':00',
                    endTime: e.endTime + ':00',
                    startRecur: e.date,
                    endRecur: e.recurrenceEndDate ? `${e.recurrenceEndDate}T23:59:59` : undefined,
                    daysOfWeek: daysOfWeek.length > 0 ? daysOfWeek : undefined,
                }];
            }
        } else {
            return [{
                ...baseEvent,
                start: `${e.date}T${e.time}:00`,
                end: `${e.date}T${e.endTime}:00`,
            }];
        }
    }),

    select: (info: any) => {
        emit('create-event', info.startStr);
    },
    eventClick: (info: any) => {
        emit('edit-event', info.event.extendedProps);
    },
    eventDrop: (info: any) => handleEventDropOrResize(info.event),
    eventResize: (info: any) => handleEventDropOrResize(info.event),
    datesSet: (info: any) => emit('dates-set', info.view.title)
}));

const handleEventDropOrResize = (calendarEvent: any) => {
    const e = calendarEvent.extendedProps;
    const start = calendarEvent.start;
    const end = calendarEvent.end || calendarEvent.start;

    const dateStr = start.toISOString().split('T')[0];
    const timeStr = start.toTimeString().substring(0, 5);
    const endTimeStr = end.toTimeString().substring(0, 5);

    const updatedEvent = {
        ...e,
        date: dateStr,
        time: timeStr,
        endTime: endTimeStr
    };

    emit('update-event-date', updatedEvent);
};
</script>

<style scoped>
.custom-calendar :deep(.fc-event) {
    cursor: pointer;
    border-radius: 6px;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
    transition: transform 0.2s, box-shadow 0.2s;
    padding: 2px 4px;
}

.custom-calendar :deep(.fc-event:hover) {
    transform: translateY(-1px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.custom-calendar :deep(.fc-col-header-cell) {
    padding: 12px 0;
    background-color: #f8fafc;
    color: #475569;
    font-weight: 700;
    text-transform: uppercase;
    font-size: 0.75rem;
    letter-spacing: 0.05em;
    border-bottom: 1px solid #e2e8f0;
}

.custom-calendar :deep(.fc-day-today) {
    background-color: #eff6ff !important;
}
</style>