"use server";

import { serverActionFetch } from "@/lib/api/fetchers";
import type {
  GetPaymentMethodsResponse,
  UserPaymentMethod,
  CreatePaymentMethodPayload,
  ApiResponse,
} from "@/types/api";

export async function getPaymentMethodsAction(): Promise<ApiResponse<GetPaymentMethodsResponse> | null> {
  return serverActionFetch<GetPaymentMethodsResponse>("/payment-methods", {
    method: "GET",
  });
}

export async function createPaymentMethodAction(
  payload: CreatePaymentMethodPayload
): Promise<ApiResponse<UserPaymentMethod> | null> {
  return serverActionFetch<UserPaymentMethod>("/payment-methods", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function deletePaymentMethodAction(
  id: string
): Promise<ApiResponse<null> | null> {
  return serverActionFetch<null>(`/payment-methods/${id}`, {
    method: "DELETE",
  });
}
