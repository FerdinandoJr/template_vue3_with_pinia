import type { IAgendaEvent } from '../entities/agenda';
import { generateUUIDv7 } from '@/util/helpers';

export const AgendaDomainService = {

    addOneHour(time: string): string {
        if (!time) return '10:00';
        const parts = time.split(':');
        const h = Number(parts[0] || '0');
        const m = Number(parts[1] || '0');
        const date = new Date();
        date.setHours(h + 1, m);
        return date.toTimeString().substring(0, 5);
    },

    generateRecurringEvents(baseEvent: IAgendaEvent): IAgendaEvent[] {
        const eventsToAdd: IAgendaEvent[] = [];
        const startDate = new Date(baseEvent.date + 'T00:00:00');

        const limitDate = baseEvent.recurrenceEndDate
            ? new Date(baseEvent.recurrenceEndDate + 'T23:59:59')
            : new Date(new Date().setMonth(new Date().getMonth() + 3));

        let currentDate = new Date(startDate);
        const groupId = generateUUIDv7();

        while (currentDate <= limitDate) {
            let shouldAdd = false;

            if (baseEvent.recurrenceType === 'daily') {
                shouldAdd = true;
            } else if (baseEvent.recurrenceType === 'monthly') {
                if (currentDate.getDate() === startDate.getDate()) shouldAdd = true;
            } else if (baseEvent.recurrenceType === 'weekly') {
                const currentDay = currentDate.getDay();
                const targetDays = baseEvent.recurrenceDays && baseEvent.recurrenceDays.length > 0
                    ? baseEvent.recurrenceDays
                    : [startDate.getDay()];

                if (targetDays.includes(currentDay)) shouldAdd = true;
            }

            if (shouldAdd) {
                eventsToAdd.push({
                    ...baseEvent,
                    id: generateUUIDv7(),
                    groupId: groupId,
                    date: currentDate.toISOString().split('T')[0] ?? '',
                    isRecurringInstance: true
                });
            }

            currentDate.setDate(currentDate.getDate() + 1);
        }

        return eventsToAdd;
    }
};