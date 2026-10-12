import { ApiError } from "./ApiError";

/**
 * Browser-side fetch wrapper for React Query hooks.
 * Does NOT attach the session token (relying on API route proxy).
 * Throws ApiError so React Query can catch it.
 */
export async function reactQueryFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const isServer = typeof window === "undefined";

  let requestHeaders: Record<string, string> = {
    ...((options.headers as Record<string, string>) || {}),
  };

  let url = endpoint;
  if (isServer) {
    let baseUrl = process.env.SITE_URL || "";
    try {
      const { cookies, headers } = await import("next/headers");
      const [cookieStore, headerStore] = await Promise.all([cookies(), headers()]);
      if (!baseUrl) {
        const host =
          headerStore.get("x-forwarded-host") ||
          headerStore.get("host") ||
          `localhost:${process.env.PORT || "3000"}`;
        const proto = headerStore.get("x-forwarded-proto") || "http";
        baseUrl = `${proto}://${host}`;
      }
      const cookieHeader = cookieStore.toString();
      if (cookieHeader) {
        requestHeaders["cookie"] = cookieHeader;
      }
    } catch {
      if (!baseUrl) {
        baseUrl = `http://localhost:${process.env.PORT || "3000"}`;
      }
    }
    url = endpoint.startsWith("http") ? endpoint : `${baseUrl}${endpoint}`;
  }

  const res = await fetch(url, {
    ...options,
    headers: requestHeaders,
  });

  // If the browser followed a redirect to the login page (due to an old implementation or server redirect)
  if (res.redirected && res.url.includes("/login")) {
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
    throw new Error("Redirecting...");
  }

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    // If the API proxy sent back a 401, redirect immediately on client
    if (res.status === 401) {
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
      throw new ApiError("Unauthorized", 401);
    }
    throw new ApiError(
      data?.error?.message || data?.message || "An unexpected error occurred.",
      res.status
    );
  }

  if (data && typeof data === "object" && "success" in data && !data.success) {
    throw new ApiError(data.message || "Request failed", data.status || 400);
  }

  return data.data as T;
}
