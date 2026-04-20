import type { IReportData } from "../domain/entities/reports";
import { TrendDirection, TicketStatusType } from "../domain/valueObjects/reports-enums";

const mockReportData: IReportData = {
  volume: [
    { day: 'SEG', value: 45 },
    { day: 'TER', value: 30 },
    { day: 'QUA', value: 65 },
    { day: 'QUI', value: 85 },
    { day: 'SEX', value: 50 },
    { day: 'SÁB', value: 75 },
    { day: 'DOM', value: 40 }
  ],
  ticketStatus: [
    { label: TicketStatusType.OPEN, percentage: 40, colorHex: '#3b82f6', dotClass: 'bg-blue-500' },
    { label: TicketStatusType.RESOLVED, percentage: 45, colorHex: '#10b981', dotClass: 'bg-green-500' },
    { label: TicketStatusType.PENDING, percentage: 15, colorHex: '#f59e0b', dotClass: 'bg-amber-500' }
  ],
  teamPerformance: [
    { name: 'ANA', percentage: 70, colorHex: '#3b82f6', dotClass: 'bg-blue-500' },
    { name: 'JOÃO', percentage: 61, colorHex: '#8b5cf6', dotClass: 'bg-purple-500' }
  ],
  responseTimes: [
    { id: '1', status: 'Urgente', time: '0h 15m', trend: TrendDirection.UP },
    { id: '2', status: 'Alta', time: '1h 30m', trend: TrendDirection.DOWN }
  ]
};

export const reportsServices = {
  async getDashboardData(): Promise<IReportData> {
    return new Promise(resolve => setTimeout(() => resolve(mockReportData), 400));
  }
};