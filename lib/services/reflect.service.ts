import { serverActionFetch } from "@/lib/api/fetchers";
import type { GetReflectResponse } from "@/types/api";

export async function fetchReflectReport(
  year: number,
  month: number,
): Promise<GetReflectResponse | null> {
  const res = await serverActionFetch<GetReflectResponse>(
    `/reflect?year=${year}&month=${month}`,
  );
  if (!res.success || !res.data) {
    throw new Error(res.message || "Failed to fetch reflect report");
  }
  return res.data;
}
