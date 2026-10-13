"use server";

import { serverActionFetch } from "@/lib/api/fetchers";
import type {
  ReflectReport,
  GenerateReflectPayload,
  ChatReflectPayload,
  ChatReflectResponse,
  ApiResponse,
} from "@/types/api";

export async function generateReflectReportAction(
  payload: GenerateReflectPayload,
): Promise<ApiResponse<ReflectReport> | null> {
  return serverActionFetch<ReflectReport>("/reflect/generate", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function chatReflectAction(
  payload: ChatReflectPayload,
): Promise<ApiResponse<ChatReflectResponse> | null> {
  return serverActionFetch<ChatReflectResponse>("/reflect/chat", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
