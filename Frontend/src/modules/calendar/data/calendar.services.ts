import type { ICalendarEvent, IClosedDay } from "../domain/entities/calendar";
import { httpClient } from "@/core/infra/HttpClient";

interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
}

const mapBackendToFrontend = (apiEvent: any): ICalendarEvent => {
  if (!apiEvent) return apiEvent;
  
 
  if (apiEvent.date && apiEvent.time) return apiEvent;

  let startDateStr = '';
  let timeStr = '';
  let endTimeStr = '';

  if (apiEvent.startDate) {
      const d = new Date(apiEvent.startDate);
      const pad = (n: number) => n.toString().padStart(2, '0');
      startDateStr = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
      timeStr = `${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  if (apiEvent.endDate) {
      const d = new Date(apiEvent.endDate);
      const pad = (n: number) => n.toString().padStart(2, '0');
      endTimeStr = `${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  let recurrenceEndDateStr = apiEvent.recurrenceEndDate;
  if (apiEvent.recurrenceEndDate) {
      recurrenceEndDateStr = apiEvent.recurrenceEndDate.split('T')[0];
  }

  const mapped = {
      ...apiEvent,
      date: startDateStr,
      time: timeStr,
      endTime: endTimeStr,
      recurrenceEndDate: recurrenceEndDateStr,
      client: apiEvent.customerId || apiEvent.client,
      clientId: apiEvent.customerId,
      userId: apiEvent.assignedTo || apiEvent.userId,
      colorHex: apiEvent.color || apiEvent.colorHex
  };
  
  console.log('[mapBackendToFrontend] input:', JSON.stringify({ assignedTo: apiEvent.assignedTo, userId: apiEvent.userId }), 'output userId:', mapped.userId);
  return mapped;
};

export const agendaServices = {
  async getEvents(): Promise<ICalendarEvent[]> {
    const response = await httpClient.get<ApiResponse<any[]>>('/agenda');
    return (response.data || []).map(mapBackendToFrontend);
  },

  async getClosedDays(): Promise<IClosedDay[]> {
    const response = await httpClient.get<ApiResponse<IClosedDay[]>>('/agenda/closed-days');
    return response.data;
  },

  async createEvent(data: Partial<ICalendarEvent>): Promise<ICalendarEvent> {
    const payload = {
        ...data,
        color: (data as any).colorHex || (data as any).color,
        customerId: (data as any).client || (data as any).clientId,
        assignedTo: (data as any).userId || (data as any).assignedTo,
    };
    console.log('[API POST /agenda] Data sent:', JSON.stringify(payload));
    const response = await httpClient.post<ApiResponse<any>>('/agenda', payload);
    return mapBackendToFrontend(response.data);
  },

  async updateEvent(id: string, data: Partial<ICalendarEvent>): Promise<ICalendarEvent> {
    const payload = {
        ...data,
        color: (data as any).colorHex || (data as any).color,
        customerId: (data as any).client || (data as any).clientId,
        assignedTo: (data as any).userId || (data as any).assignedTo,
    };
    const response = await httpClient.put<ApiResponse<any>>(`/agenda/${id}`, payload);
    return mapBackendToFrontend(response.data);
  },

  async deleteEvent(id: string): Promise<void> {
    await httpClient.delete(`/agenda/${id}`);
  },
};