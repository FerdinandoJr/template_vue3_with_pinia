export class AppointmentService {
    static calculateEndTime(oldStart: string, oldEnd: string, newStart: string): string {
        const [startH = 0, startM = 0] = oldStart.split(":").map(Number);
        const [endH = 0, endM = 0] = oldEnd.split(":").map(Number);
        
        const durationMin = (endH * 60 + endM) - (startH * 60 + startM);

        const [newStartH = 0, newStartM = 0] = newStart.split(":").map(Number);
        const newEndTotal = (newStartH * 60 + newStartM) + durationMin;

        const finalEndH = Math.floor(newEndTotal / 60);
        const finalEndM = newEndTotal % 60;
        
        return `${finalEndH.toString().padStart(2, "0")}:${finalEndM.toString().padStart(2, "0")}`;
    }
}