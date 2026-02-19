import type { ReportMetrics } from "../../domain/entities/ReportMetrics";
import type { IReportsRepository } from "../../domain/repositories/IReportsRepository";

export class InMemoryReportsRepository implements IReportsRepository {
  async getMetrics(): Promise<ReportMetrics> {
    return new Promise((resolve) =>
      setTimeout(
        () =>
          resolve({
            weeklyVolume: [
              { day: "SEG", value: 45 },
              { day: "TER", value: 30 },
              { day: "QUA", value: 65 },
              { day: "QUI", value: 85 },
              { day: "SEX", value: 50 },
              { day: "SÁB", value: 75 },
              { day: "DOM", value: 60 },
            ],
            statusDistribution: [
              { label: "ABERTOS", percent: 40, color: "#3b82f6" },
              { label: "RESOLVIDOS", percent: 45, color: "#10b981" },
              { label: "PENDENTES", percent: 15, color: "#f59e0b" },
            ],
            teamPerformance: [
              { name: "ANA", score: 70, color: "#3b82f6" },
              { name: "JOÃO", score: 61, color: "#6366f1" },
              { name: "PEDRO", score: 85, color: "#10b981" },
              { name: "MARIA", score: 92, color: "#34d399" },
            ],
            responseTimes: [
              { priority: "Urgente", time: "0h 15m", trend: "up" },
              { priority: "Alta", time: "1h 30m", trend: "down" },
              { priority: "Média", time: "4h 00m", trend: "up" },
              { priority: "Baixa", time: "24h", trend: "flat" },
            ],
          }),
        500,
      ),
    );
  }
}
