"use server";

import { serverActionFetch } from "@/lib/api/fetchers";
import type { CreateIncomePayload, Income, ApiResponse } from "@/types/api";

export async function addIncomeAction(
  payload: CreateIncomePayload,
  clientId?: string
): Promise<ApiResponse<Income> | null> {
  return serverActionFetch<Income>("/income", {
    method: "POST",
    body: JSON.stringify(payload),
    clientId,
  });
}
