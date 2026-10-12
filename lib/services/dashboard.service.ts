import { serverActionFetch } from "@/lib/api/fetchers";
import type { DashboardMetrics } from "@/types/api";

export async function fetchDashboard(
  year: number,
  month: number
): Promise<DashboardMetrics | null> {
  const res = await serverActionFetch<DashboardMetrics>(
    `/dashboard?year=${year}&month=${month}`,
  );
  if (!res.success || !res.data) {
    throw new Error(res.message || "Failed to fetch dashboard metrics");
  }
  return res.data;
}
