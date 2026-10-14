"use server";

import { serverActionFetch } from "@/lib/api/fetchers";
import type {
  UserCategory,
  CreateCategoryPayload,
  ApiResponse,
} from "@/types/api";

export async function createCategoryAction(
  payload: CreateCategoryPayload,
  clientId?: string
): Promise<ApiResponse<UserCategory> | null> {
  return serverActionFetch<UserCategory>("/categories", {
    method: "POST",
    body: JSON.stringify(payload),
    clientId,
  });
}

export async function deleteCategoryAction(
  id: string,
  clientId?: string
): Promise<ApiResponse<null> | null> {
  return serverActionFetch<null>(`/categories/${id}`, {
    method: "DELETE",
    clientId,
  });
}
