"use server";

import { serverActionFetch } from "@/lib/api/fetchers";
import type { SetAllowancePayload, MonthlyAllowance, ApiResponse } from "@/types/api";

export async function updateAllowanceAction(
  payload: SetAllowancePayload
): Promise<ApiResponse<MonthlyAllowance>> {
  const res = await serverActionFetch<MonthlyAllowance>("/allowance", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return res;
}
