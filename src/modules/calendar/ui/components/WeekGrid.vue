<template>
  <div class="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col overflow-hidden h-full select-none font-sans">
    
    <div 
        class="grid border-b border-slate-200 bg-white shrink-0 pr-[6px] z-30 shadow-sm relative"
        :class="mode === 'day' ? 'grid-cols-[64px_1fr]' : 'grid-cols-8 divide-x divide-slate-100'"
    >
      <div class="w-16 py-3 flex items-center justify-center text-[10px] font-bold text-slate-400 bg-slate-50">
        GMT-3
      </div>
      
      <div 
        v-for="day in weekDays" 
        :key="day.date.toISOString()" 
        class="py-3 text-center group relative border-b-2 transition-colors flex flex-col items-center justify-center"
        :class="[
            day.isToday ? 'border-blue-600 bg-blue-50/30' : 'border-transparent hover:bg-slate-50',
            mode === 'day' ? 'items-start pl-6' : ''
        ]"
      >
        <div :class="mode === 'day' ? 'flex items-center gap-3' : ''">
            <p class="text-[10px] font-bold uppercase tracking-widest mb-1 transition-colors" 
            :class="day.isToday ? 'text-blue-600' : 'text-slate-400'">
            {{ day.label }}
            </p>
            <div 
            class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all"
            :class="day.isToday ? 'bg-blue-600 text-white shadow-md' : 'text-slate-700 group-hover:bg-slate-200'"
            >
            {{ day.dayNumber }}
            </div>
        </div>
      </div>
    </div>

    <div 
      class="flex-1 overflow-y-auto custom-scrollbar relative bg-white" 
      ref="scrollContainer"
      @mousemove="handleResizeMove"
      @mouseup="handleResizeEnd"
      @mouseleave="handleResizeEnd"
    >
      <div 
        class="grid min-h-[1440px] relative pb-20"
        :class="mode === 'day' ? 'grid-cols-[64px_1fr]' : 'grid-cols-8 divide-x divide-slate-100'"
      >
        
        <div class="w-16 bg-white border-r border-slate-200 relative select-none z-20">
           <div v-for="hour in 24" :key="hour" class="h-[60px] relative border-b border-transparent">
             <span class="absolute -top-2.5 right-2 block text-xs font-medium text-slate-400">
                {{ String(hour - 1).padStart(2, '0') }}:00
             </span>
           </div>

           <div 
             class="absolute right-0 z-50 transform translate-y-[-50%] pr-1 pointer-events-none transition-all duration-1000 ease-linear flex items-center"
             :style="{ top: currentTimeTop + 'px' }"
           >
             <div class="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md shadow-sm">
               {{ currentHourStr }}
             </div>
           </div>
        </div>

        <div 
          v-for="day in weekDays" 
          :key="day.date.toISOString()" 
          class="relative group h-full border-r border-slate-100 last:border-none cursor-cell" 
          :class="day.isToday ? 'bg-blue-50/5' : ''"
          @dragover.prevent
          @drop="onDrop($event, day.date)"
          @click="handleColumnClick($event, day.date)"
        >
            <div v-for="h in 24" :key="h" class="absolute w-full border-b border-slate-100 h-[60px] pointer-events-none" :style="{ top: `${(h-1)*60}px` }"></div>

            <div 
                v-if="day.isToday" 
                class="absolute left-0 w-full z-20 pointer-events-none flex items-center transition-all duration-1000 ease-linear" 
                :style="{ top: currentTimeTop + 'px' }"
            >
               <div class="w-2.5 h-2.5 bg-red-500 rounded-full -ml-[5px] ring-2 ring-white shadow-sm"></div>
               <div class="h-[2px] bg-red-500 w-full opacity-80 shadow-sm"></div>
            </div>

            <div 
              v-for="apt in getDailyAppointments(day.date)"
              :key="apt.id"
              class="absolute left-1 right-1 rounded-md px-2 py-1 border-l-4 shadow-sm cursor-pointer hover:brightness-95 hover:shadow-md transition-all overflow-hidden z-10 flex flex-col group/card"
              :class="{ 'z-50 ring-2 ring-blue-400 opacity-90': isResizing && resizeState.id === apt.id }"
              :style="getEventStyle(apt)"
              draggable="true"
              @dragstart="onDragStart($event, apt)"
              @click.stop="$emit('edit', apt)"
            >
               <div class="flex justify-between items-start pointer-events-none overflow-hidden mb-0.5">
                   <span class="font-bold text-xs truncate leading-tight">{{ apt.title }}</span>
               </div>
               
               <div class="flex items-center gap-1 mb-auto pointer-events-none">
                 <div class="text-[10px] opacity-90 truncate font-medium">{{ apt.clientName }}</div>
               </div>
               
               <div class="mt-1 text-[9px] opacity-75 font-mono hidden group-hover/card:block pointer-events-none bg-white/40 px-1 rounded w-fit backdrop-blur-sm">
                 {{ isResizing && resizeState.id === apt.id ? `${apt.time} - ${resizeState.tempEndTime}` : `${apt.time} - ${apt.endTime}` }}
               </div>

               <div 
                 class="absolute bottom-0 left-0 right-0 h-3 cursor-s-resize flex justify-center items-end group/handle z-20"
                 @mousedown.stop.prevent="handleResizeStart($event, apt)"
               >
                  <div class="w-8 h-1 bg-slate-500/20 rounded-full mb-1 opacity-0 group-hover/handle:opacity-100 transition-opacity"></div>
               </div>
            </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted, toRef } from 'vue';
import type { Appointment } from '../../domain/entities/Appointment';
import { useAppointmentResize } from '../composables/useAppointmentResize';
import { useDragAndDrop } from '../composables/useDragAndDrop';

const props = defineProps<{
  currentDate: Date;
  appointments: Appointment[];
  mode: 'week' | 'day';
}>();

const emit = defineEmits(['update-appointment', 'edit', 'select-slot']);

// Refs convertidas para composables
const appointmentsRef = toRef(props, 'appointments');
const { isResizing, resizeState, handleResizeStart, handleResizeMove, handleResizeEnd } = useAppointmentResize(appointmentsRef, (payload) => emit('update-appointment', payload));
const { onDragStart, onDrop } = useDragAndDrop(isResizing, (payload) => emit('update-appointment', payload));

// Lógica de Dias
const weekDays = computed(() => {
    const curr = new Date(props.currentDate);
    const days = [];

    if (props.mode === 'day') {
        days.push({
            date: new Date(curr),
            label: curr.toLocaleDateString('pt-BR', { weekday: 'long' }),
            dayNumber: curr.getDate(),
            isToday: new Date().toDateString() === curr.toDateString()
        });
    } else {
        const day = curr.getDay(); 
        const first = curr.getDate() - day;
        for (let i = 0; i < 7; i++) {
            const next = new Date(curr.getTime());
            next.setDate(first + i);
            days.push({
                date: next,
                label: next.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', ''),
                dayNumber: next.getDate(),
                isToday: new Date().toDateString() === next.toDateString()
            });
        }
    }
    return days;
});

const getDailyAppointments = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return props.appointments.filter(a => a.date === dateStr);
};

// Click no Slot (Criar Agenda)
const handleColumnClick = (event: MouseEvent, date: Date) => {
    if (isResizing.value) return;

    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const offsetY = event.clientY - rect.top; 
    
    const hour = Math.floor(offsetY / 60);
    const rawMinutes = Math.floor(offsetY % 60);
    const roundedMinutes = rawMinutes < 30 ? 0 : 30;
    
    const timeStr = `${hour.toString().padStart(2,'0')}:${roundedMinutes.toString().padStart(2,'0')}`;
    emit('select-slot', { date, time: timeStr });
};

// Style Calc
const getEventStyle = (apt: Appointment) => {
    const [startH = 0, startM = 0] = apt.time.split(':').map(Number);
    const [endH = 0, endM = 0] = apt.endTime.split(':').map(Number);
    
    const startMinutes = startH * 60 + startM;
    let height = (endH * 60 + endM) - startMinutes;
    
    if (isResizing.value && resizeState.id === apt.id) {
        height = resizeState.currentHeight;
    }

    return {
        top: `${startMinutes}px`,
        height: `${Math.max(height, 30)}px`, 
        backgroundColor: `${apt.color}25`, 
        borderLeftColor: apt.color,
        color: '#0f172a',
        zIndex: isResizing.value && resizeState.id === apt.id ? 50 : 10
    };
};

// Time Marker
const currentTimeTop = ref(0);
const currentHourStr = ref('');
let timer: any;

const updateTimePosition = () => {
    const now = new Date();
    currentTimeTop.value = now.getHours() * 60 + now.getMinutes();
    currentHourStr.value = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const scrollContainer = ref<HTMLElement | null>(null);

onMounted(() => {
    updateTimePosition();
    timer = setInterval(updateTimePosition, 60000); 
    if (scrollContainer.value) {
        const target = Math.max(0, currentTimeTop.value - 120);
        scrollContainer.value.scrollTop = target > 0 ? target : 480; 
    }
});

onUnmounted(() => clearInterval(timer));
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
</style>