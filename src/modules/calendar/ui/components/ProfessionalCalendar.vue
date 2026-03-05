<template>
    <div class="h-full w-full bg-white rounded-2xl overflow-hidden relative shadow-sm border border-slate-200">
        <FullCalendar ref="calendarRef" :options="calendarOptions" class="h-full w-full" />
    </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import ptBrLocale from '@fullcalendar/core/locales/pt-br'
import type { CalendarOptions } from '@fullcalendar/core'
import { useCalendarStore } from '../store/calendar.store'

const props = defineProps<{
    currentView: string;
}>();

const emit = defineEmits(['create-event', 'edit-event', 'update-event-date', 'dates-set'])
const store = useCalendarStore()
const calendarRef = ref<any>(null)

defineExpose({
    getApi: () => calendarRef.value?.getApi()
})

const calendarEvents = computed(() => {
    return store.filteredEvents.map(evt => {
        const defaultOwner = { name: 'Desconhecido', avatar: '?', color: '#94a3b8' };
        const owner = store.availableUsers.find(u => u.id === evt.userId) || store.currentUser || defaultOwner;
        const finalEnd = evt.endTime ? `${evt.date}T${evt.endTime}` : computeEndTime(evt.date, evt.time);
        const colorStyle = getEventColor(evt.dotClass);

        return {
            id: evt.id,
            title: evt.client || 'Sem Cliente',
            start: `${evt.date}T${evt.time}`,
            end: finalEnd,
            backgroundColor: colorStyle.bg,
            borderColor: 'transparent',
            textColor: colorStyle.text,
            extendedProps: {
                ...evt,
                originalTitle: evt.title,
                hasDescription: !!evt.description,
                isRecurring: !!evt.groupId || !!evt.isRecurringInstance,
                participantCount: evt.participants?.length || 0,
                ownerName: owner.name,
                ownerAvatar: owner.avatar,
                ownerColor: owner.color
            }
        }
    })
})

const calendarOptions = ref<CalendarOptions>({
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    initialView: 'dayGridMonth',
    locale: ptBrLocale,
    headerToolbar: false,
    height: '100%',
    contentHeight: 'auto',
    expandRows: true,
    stickyHeaderDates: true,
    slotMinTime: "06:00:00",
    slotMaxTime: "23:00:00",
    allDaySlot: false,
    slotDuration: "00:15:00",
    slotLabelInterval: "01:00",
    slotEventOverlap: false,
    dayMaxEvents: 2,
    weekends: true,
    nowIndicator: true,
    editable: true,
    selectable: true,
    selectMirror: true,
    eventResizableFromStart: true,

    events: calendarEvents.value as any,

    eventContent: function (arg) {
        const p = arg.event.extendedProps;
        const iconRecur = p.isRecurring ? '<span class="text-[9px] font-bold opacity-70 ml-1" title="Série Recorrente">↻</span>' : '';
        const iconDesc = p.hasDescription ? '<span class="text-[9px] opacity-70 ml-1" title="Ver detalhes">≣</span>' : '';
        const timeDisplay = arg.timeText || '';

        return {
            html: `
        <div class="flex flex-col px-2 py-1 leading-tight h-full w-full relative group overflow-hidden border-l-[3px] transition-all hover:brightness-95 hover:shadow-md"
             style="border-left-color: ${p.ownerColor}; background-color: ${arg.event.backgroundColor}; color: ${arg.event.textColor}; border-radius: 3px;">
          
          <div class="flex justify-between items-center mb-0.5 pb-0.5 border-b border-black/5">
             <span class="font-bold text-[10px] tracking-tight opacity-90">${timeDisplay}</span>
             
             <div class="flex items-center gap-0.5">
                 ${iconRecur}
                 <div class="w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-black text-white shadow-sm ring-1 ring-white/50"
                      style="background-color: ${p.ownerColor}" 
                      title="Agendado por: ${p.ownerName}">
                    ${p.ownerAvatar}
                 </div>
             </div>
          </div>
          
          <div class="flex flex-col justify-center flex-1 min-h-0">
              <div class="font-extrabold text-[10px] truncate leading-tight">
                ${arg.event.title}
              </div>
              <div class="text-[9px] opacity-80 truncate flex items-center mt-0.5">
                ${p.originalTitle || '(Sem título)'} ${iconDesc}
              </div>
          </div>
        </div>
      `
        }
    },

    select: (info) => {
        emit('create-event', info.startStr);
        info.view.calendar.unselect()
    },
    eventClick: (info) => {
        emit('edit-event', info.event.extendedProps)
    },
    datesSet: (info) => {
        emit('dates-set', info.view.title)
    },
    eventDrop: (info) => handleEventChange(info),
    eventResize: (info) => handleEventChange(info)
})

function handleEventChange(info: any) {
    if (!info.event.start) return;

    const formatTime = (d: Date) => d.getHours().toString().padStart(2, '0') + ':' + d.getMinutes().toString().padStart(2, '0');

    const newDate = info.event.start.toISOString().split('T')[0];
    const newTime = formatTime(info.event.start);

    let newEndTime = '';
    if (info.event.end) {
        newEndTime = formatTime(info.event.end);
    } else {
        const d = new Date(info.event.start);
        d.setHours(d.getHours() + 1);
        newEndTime = formatTime(d);
    }

    emit('update-event-date', {
        ...info.event.extendedProps,
        date: newDate,
        time: newTime,
        endTime: newEndTime
    });
}

watch(calendarEvents, (newEvents) => {
    calendarOptions.value.events = newEvents as any;
}, { deep: true });

watch(() => props.currentView, (val) => {
    const api = calendarRef.value?.getApi()
    if (api) api.changeView(val)
})

function computeEndTime(date: string, time: string) {
    const d = new Date(`${date}T${time}`)
    d.setHours(d.getHours() + 1)
    return d.toISOString()
}

function getEventColor(dotClass?: string) {
    const map: Record<string, { bg: string, text: string }> = {
        'bg-emerald-400': { bg: '#ecfdf5', text: '#065f46' },
        'bg-amber-400': { bg: '#fffbeb', text: '#92400e' },
        'bg-blue-400': { bg: '#eff6ff', text: '#1e40af' },
        'bg-red-400': { bg: '#fef2f2', text: '#991b1b' },
        'bg-purple-400': { bg: '#faf5ff', text: '#6b21a8' }
    }
    return map[dotClass || ''] || { bg: '#f8fafc', text: '#334155' }
}
</script>

<style>
.fc {
    font-family: 'Inter', 'Segoe UI', sans-serif;
    --fc-border-color: #f1f5f9;
    --fc-today-bg-color: #f8fafc;
    --fc-now-indicator-color: #ef4444;
}

.fc-col-header-cell-cushion {
    color: #64748b;
    text-transform: uppercase;
    font-size: 0.7rem;
    font-weight: 800;
    letter-spacing: 0.05em;
    padding: 12px 0 !important;
    text-decoration: none !important;
}

.fc-daygrid-day-number {
    font-size: 0.85rem;
    font-weight: 600;
    color: #475569;
    padding: 8px !important;
    text-decoration: none !important;
}

.fc-event {
    border: none !important;
    background: transparent !important;
    box-shadow: none !important;
    margin: 1px !important;
}

.fc-event:hover {
    z-index: 50;
}

.fc-scroller::-webkit-scrollbar {
    width: 6px;
    height: 6px;
}

.fc-scroller::-webkit-scrollbar-track {
    background: transparent;
}

.fc-scroller::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 3px;
}

.fc-scroller::-webkit-scrollbar-thumb:hover {
    background: #94a3b8;
}

.fc-timegrid-slot-label {
    font-size: 0.7rem;
    color: #94a3b8;
    font-weight: 600;
}

.fc-timegrid-divider {
    display: none;
}
</style>