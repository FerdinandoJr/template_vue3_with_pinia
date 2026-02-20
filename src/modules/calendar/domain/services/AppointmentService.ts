export class AppointmentService {

    static calculateEndTime(oldStart: string, oldEnd: string, newStart: string): string {
        const [startH = 0, startM = 0] = oldStart.split(":").map(Number);
        const [endH = 0, endM = 0] = oldEnd.split(":").map(Number);
        
        const durationMin = (endH * 60 + endM) - (startH * 60 + startM);

        const [newStartH = 0, newStartM = 0] = newStart.split(":").map(Number);
        const newEndTotal = (newStartH * 60 + newStartM) + durationMin;

        const finalEndH = Math.floor(newEndTotal / 60) % 24;
        const finalEndM = newEndTotal % 60;
        
        return `${finalEndH.toString().padStart(2, "0")}:${finalEndM.toString().padStart(2, "0")}`;
    }

    /**
     * Retorna o horário de término padrão para um novo agendamento.
     * @param startTime Horário de início (HH:mm)
     * @param defaultDurationMinutes Duração padrão em minutos (default: 60)
     */
    static getDefaultEndTime(startTime: string, defaultDurationMinutes: number = 60): string {
        const [h = 0, m = 0] = startTime.split(':').map(Number);
        const totalMinutes = h * 60 + m + defaultDurationMinutes;
        
        const endH = Math.floor(totalMinutes / 60) % 24;
        const endM = totalMinutes % 60;
        
        return `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;
    }
}