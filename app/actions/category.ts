"use server";

import { serverActionFetch } from "@/lib/api/fetchers";
import type {
  GetCategoriesResponse,
  UserCategory,
  CreateCategoryPayload,
  ApiResponse,
} from "@/types/api";

export async function getCategoriesAction(type?: string): Promise<ApiResponse<GetCategoriesResponse> | null> {
  const query = type ? `?type=${type}` : "";
  return serverActionFetch<GetCategoriesResponse>(`/categories${query}`, {
    method: "GET",
  });
}

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
