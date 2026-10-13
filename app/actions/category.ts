"use server";

import { serverActionFetch } from "@/lib/api/fetchers";
import type {
  UserCategory,
  CreateCategoryPayload,
  ApiResponse,
} from "@/types/api";

export async function createCategoryAction(
  payload: CreateCategoryPayload
): Promise<ApiResponse<UserCategory> | null> {
  return serverActionFetch<UserCategory>("/categories", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function deleteCategoryAction(
  id: string
): Promise<ApiResponse<null> | null> {
  return serverActionFetch<null>(`/categories/${id}`, {
    method: "DELETE",
  });
}
