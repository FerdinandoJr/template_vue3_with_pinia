export interface DashboardStat {
  label: string;
  value: string | number;
  icon: string;
  bgClass: string;
  trend: number;
}

export interface ChartSeries {
  name: string;
  data: number[];
}

export interface ActivityItem {
  id: number;
  userAvatar: string;
  userName: string;
  action: string;
  target: string;
  fromStatus?: string;
  toStatus?: string;
  time: string;
}

export interface DashboardData {
  stats: DashboardStat[];
  volumeSeries: ChartSeries[];
  statusSeries: number[];
  performanceSeries: ChartSeries[];
  recentActivity: ActivityItem[];
}
