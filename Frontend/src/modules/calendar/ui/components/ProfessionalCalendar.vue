<template>
    <div class="h-full w-full bg-white relative">
        <FullCalendar ref="fullCalendarRef" :options="calendarOptions" class="h-full w-full custom-premium-calendar" />
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
    
   
    slotMinTime: '00:00:00',
    slotMaxTime: '24:00:00',
    slotDuration: '00:30:00',
    height: '100%',
    nowIndicator: true,
    handleWindowResize: true,

    slotLabelFormat: { hour: '2-digit' as const, minute: '2-digit' as const, omitZeroMinute: false, hour12: false },
    eventTimeFormat: { hour: '2-digit' as const, minute: '2-digit' as const, omitZeroMinute: false, hour12: false },

   
    events: store.filteredEvents.flatMap((e: any): any[] => {
        const user = store.availableUsers.find(u => u.id === e.userId);
        const theme = user?.theme || { primary: '#3b82f6', light: '#eff6ff', dark: '#1e40af' };

        const eventBgColor = e.colorHex ? e.colorHex : theme.light;
        const eventBorderColor = e.colorHex ? e.colorHex : theme.primary;
        const eventTextColor = e.colorHex ? '#ffffff' : theme.dark;
        
        const eventStart = e.startDate || (e.date && e.time ? `${e.date}T${e.time}:00` : undefined);
        const eventEnd = e.endDate || (e.date && e.endTime ? `${e.date}T${e.endTime}:00` : undefined);
        
        console.log('[events mapping] e.userId:', e.userId, 'selectedUserIds:', store.selectedUserIds, 'match:', store.selectedUserIds.includes(e.userId));

        const baseEvent = {
            id: e.id,
            title: e.isBlocker ? `🔒 ${e.title}` : e.title,
            start: eventStart,
            end: eventEnd,
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
                    : new Date(currentDate.getFullYear() + 1, currentDate.getMonth(), currentDate.getDate());

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
    emit('update-event-date', { 
        ...e, 
        date: start.toISOString().split('T')[0], 
        time: start.toTimeString().substring(0, 5), 
        endTime: end.toTimeString().substring(0, 5) 
    });
};
</script>

<style>

.custom-premium-calendar .fc-event {
    cursor: pointer !important;
    border-radius: 8px !important;
    border-left-width: 5px !important;
    border-top: none !important;
    border-right: none !important;
    border-bottom: none !important;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04) !important;
    padding: 4px 8px !important;
    font-weight: 700 !important;
    font-size: 12px !important;
    transition: all 0.2s ease;
}

.custom-premium-calendar .fc-event:hover {
    transform: translateY(-1px) scale(1.01) !important;
    box-shadow: 0 8px 12px rgba(0, 0, 0, 0.08) !important;
}

.custom-premium-calendar .is-blocked-slot {
    background: repeating-linear-gradient(45deg, #f8fafc, #f8fafc 10px, #f1f5f9 10px, #f1f5f9 20px) !important;
    border-left: 5px solid #94a3b8 !important;
    border: 1px dashed #cbd5e1 !important;
    color: #64748b !important;
}

.custom-premium-calendar .fc-col-header-cell {
    padding: 15px 0 !important;
    background-color: #f8fafd !important;
    color: #475569 !important;
    font-weight: 800 !important;
    text-transform: uppercase !important;
    font-size: 11px !important;
    border-bottom: 2px solid #e2e8f0 !important;
}

.custom-premium-calendar .fc-timegrid-now-indicator-line {
    border-color: #3b82f6 !important;
    border-width: 2px !important;
}

.custom-premium-calendar .fc-timegrid-now-indicator-arrow {
    border-color: #3b82f6 !important;
    background-color: #3b82f6 !important;
}
</style>