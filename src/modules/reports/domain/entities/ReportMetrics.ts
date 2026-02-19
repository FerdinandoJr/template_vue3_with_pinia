export interface WeeklyData {
  day: string;
  value: number;
}

export interface TicketStatusMetric {
  label: string;
  percent: number;
  color: string;
}

export interface TeamMemberPerformance {
  name: string;
  score: number;
  color: string;
}

export interface ResponseTimeMetric {
  priority: string;
  time: string;
  trend: "up" | "down" | "flat";
}

export interface ReportMetrics {
  weeklyVolume: WeeklyData[];
  statusDistribution: TicketStatusMetric[];
  teamPerformance: TeamMemberPerformance[];
  responseTimes: ResponseTimeMetric[];
}
