import type { Ref } from 'vue';
import type { Appointment } from '../../domain/entities/Appointment';

export function useDragAndDrop(isResizing: Ref<boolean>, emitUpdate: (payload: any) => void) {
    
    const onDragStart = (event: DragEvent, apt: Appointment) => {
        if (isResizing.value) {
            event.preventDefault(); 
            return;
        }
        if (event.dataTransfer) {
            event.dataTransfer.effectAllowed = 'move';
            event.dataTransfer.setData('appt-id', apt.id.toString());
            const ghost = document.createElement('div');
            ghost.style.opacity = '0';
            document.body.appendChild(ghost);
            event.dataTransfer.setDragImage(ghost, 0, 0);
            setTimeout(() => document.body.removeChild(ghost), 0);
        }
    };

    const onDrop = (event: DragEvent, date: Date) => {
        const apptId = event.dataTransfer?.getData('appt-id');
        if (apptId) {
            const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
            const offsetY = event.clientY - rect.top; 
            const hour = Math.floor(offsetY / 60);
            const rawMinutes = Math.floor(offsetY % 60);
            const roundedMinutes = Math.round(rawMinutes / 15) * 15;
            
            const finalHour = roundedMinutes === 60 ? hour + 1 : hour;
            const finalMinutes = roundedMinutes === 60 ? 0 : roundedMinutes;
            
            if (finalHour > 23) return;
            const timeStr = `${finalHour.toString().padStart(2,'0')}:${finalMinutes.toString().padStart(2,'0')}`;
            
            emitUpdate({ id: parseInt(apptId), date: date, time: timeStr });
        }
    };

    return { onDragStart, onDrop };
}