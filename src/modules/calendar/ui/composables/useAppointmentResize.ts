import { reactive, ref, type Ref } from 'vue';
import type { Appointment } from '../../domain/entities/Appointment';

export function useAppointmentResize(appointments: Ref<Appointment[]>, emitUpdate: (payload: any) => void) {
    const isResizing = ref(false);
    const resizeState = reactive({
        id: 0,
        startY: 0,
        startHeight: 0,
        currentHeight: 0,
        startTimeMinutes: 0,
        tempEndTime: ''
    });

    const handleResizeStart = (event: MouseEvent, apt: Appointment) => {
        isResizing.value = true;
        resizeState.id = apt.id;
        resizeState.startY = event.clientY;
        
        const [sH = 0, sM = 0] = apt.time.split(':').map(Number);
        const [eH = 0, eM = 0] = apt.endTime.split(':').map(Number);
        
        resizeState.startTimeMinutes = sH * 60 + sM;
        resizeState.startHeight = (eH * 60 + eM) - resizeState.startTimeMinutes;
        resizeState.currentHeight = resizeState.startHeight;
        resizeState.tempEndTime = apt.endTime;
    };

    const handleResizeMove = (event: MouseEvent) => {
        if (!isResizing.value) return;
        const deltaY = event.clientY - resizeState.startY;
        let newHeight = resizeState.startHeight + deltaY;
        newHeight = Math.round(newHeight / 15) * 15; 
        if (newHeight < 30) newHeight = 30;
        
        resizeState.currentHeight = newHeight;
        const endTotalMinutes = resizeState.startTimeMinutes + newHeight;
        const endH = Math.floor(endTotalMinutes / 60);
        const endM = endTotalMinutes % 60;
        
        if (endH >= 24) return; 
        resizeState.tempEndTime = `${String(endH).padStart(2,'0')}:${String(endM).padStart(2,'0')}`;
    };

    const handleResizeEnd = () => {
        if (!isResizing.value) return;
        const apt = appointments.value.find(a => a.id === resizeState.id);
        
        if (apt) {
            const dateParts = apt.date.split('-').map(Number);
            const dateObj = new Date(dateParts[0] ?? 2026, (dateParts[1] ?? 1) - 1, dateParts[2] ?? 1);
            emitUpdate({ id: apt.id, date: dateObj, time: apt.time, endTime: resizeState.tempEndTime });
        }
        
        isResizing.value = false;
        resizeState.id = 0;
    };

    return { isResizing, resizeState, handleResizeStart, handleResizeMove, handleResizeEnd };
}