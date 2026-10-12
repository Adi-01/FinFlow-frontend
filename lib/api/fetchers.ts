import "server-only";

import { BACKEND_URL } from "../constants";
import { getSessionCookie, removeSessionCookie } from "../auth";
import { redirect } from "next/navigation";
import { ApiError } from "./ApiError";
import { NextResponse } from "next/server";
import type { ApiResponse } from "@/types/api";

interface FetchOptions extends RequestInit {
  headers?: Record<string, string>;
}

/**
 * 2. coreFetch (Internal)
 * Attaches token and throws ApiError for non-200 responses.
 */
async function coreFetch<T>(endpoint: string, options: FetchOptions = {}): Promise<ApiResponse<T>> {
  let token: string | undefined;
  
  try {
    token = await getSessionCookie();
  } catch (err) {
    // getSessionCookie uses cookies(), which might fail in some contexts, but usually works in Server Actions / API Routes.
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const url = endpoint.startsWith("http")
    ? endpoint
    : `${BACKEND_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  const response = await fetch(url, { ...options, headers });
  
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new ApiError(
      data?.error?.message || data?.message || "An unexpected error occurred.",
      response.status,
      data?.error?.type,
      data?.error?.code,
      data?.error?.details
    );
  }

  return data as ApiResponse<T>;
}

/**
 * 3. serverActionFetch
 * Wraps coreFetch for Server Actions.
 * Re-throws NEXT_REDIRECT. Handles 401. Returns standardized { success: false } on error.
 */
export async function serverActionFetch<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<ApiResponse<T>> {
  try {
    return await coreFetch<T>(endpoint, options);
  } catch (error: any) {
    if (error?.message === "NEXT_REDIRECT") throw error;

    if (error instanceof ApiError) {
      if (error.statusCode === 401) {
        const isAuthEndpoint = endpoint.includes("/auth/login") || endpoint.includes("/auth/register");
        if (!isAuthEndpoint) {
          try {
            await removeSessionCookie();
          } catch {} // ignore if called from server component layout
          redirect("/login");
        }
      }
      return { 
        success: false, 
        status: error.statusCode, 
        message: error.message,
        data: null as any
      };
    }

    return { 
      success: false, 
      status: 500, 
      message: error instanceof Error ? error.message : "Internal Server Error",
      data: null as any
    };
  }
}

/**
 * 4. routeHandlerFetch
 * Wraps coreFetch for Next.js API Route Handlers.
 * Returns NextResponse.
 */
export async function routeHandlerFetch(
  endpoint: string,
  options: FetchOptions = {}
) {
  try {
    const data = await coreFetch(endpoint, options);
    return NextResponse.json(data);
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "NEXT_REDIRECT") throw error;

    if (error instanceof ApiError) {
      if (error.statusCode === 401) {
        const isAuthEndpoint = endpoint.includes("/auth/login") || endpoint.includes("/auth/register");
        if (!isAuthEndpoint) {
          try {
            await removeSessionCookie();
          } catch {} 
        }
      }
      // Pass the backend error cleanly down to the client
      return NextResponse.json(
        { success: false, message: error.message, error: { message: error.message, statusCode: error.statusCode } }, 
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Internal Server Error" }, 
      { status: 500 }
    );
  }
}


