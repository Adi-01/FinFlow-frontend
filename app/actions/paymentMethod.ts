"use server";

import { serverActionFetch } from "@/lib/api/fetchers";
import type {
  UserPaymentMethod,
  CreatePaymentMethodPayload,
  ApiResponse,
} from "@/types/api";

export async function createPaymentMethodAction(
  payload: CreatePaymentMethodPayload,
  clientId?: string
): Promise<ApiResponse<UserPaymentMethod> | null> {
  return serverActionFetch<UserPaymentMethod>("/payment-methods", {
    method: "POST",
    body: JSON.stringify(payload),
    clientId,
  });
}

export async function deletePaymentMethodAction(
  id: string,
  clientId?: string
): Promise<ApiResponse<null> | null> {
  return serverActionFetch<null>(`/payment-methods/${id}`, {
    method: "DELETE",
    clientId,
  });
}
