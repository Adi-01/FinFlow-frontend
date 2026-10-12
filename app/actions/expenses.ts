"use server";

import { serverActionFetch } from "@/lib/api/fetchers";
import type { CreateExpensePayload, Expense, ApiResponse } from "@/types/api";

export async function addExpenseAction(
  payload: CreateExpensePayload
): Promise<ApiResponse<Expense> | null> {
  return serverActionFetch<Expense>("/expenses", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
