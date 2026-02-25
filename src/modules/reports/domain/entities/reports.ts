import type { TrendDirection, TicketStatusType } from "../valueObjects/reports-enums";

export interface IWeeklyVolume {
  day: string;
  value: number; 
}

export interface ITicketStatus {
  label: TicketStatusType | string; 
  percentage: number;
  colorHex: string; 
  dotClass: string; 
}

export interface ITeamPerformance {
  name: string;
  percentage: number;
  colorHex: string;
  dotClass: string;
}

export interface IResponseTime {
  id: string;
  status: string;
  time: string;
  trend: TrendDirection;
}

export interface IReportData {
  volume: IWeeklyVolume[];
  ticketStatus: ITicketStatus[];
  teamPerformance: ITeamPerformance[];
  responseTimes: IResponseTime[];
}