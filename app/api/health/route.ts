import { routeHandlerFetch } from "@/lib/api/fetchers";

export const dynamic = "force-dynamic";

export async function GET() {
  return routeHandlerFetch("/health", {
    cache: "no-store",
    signal: AbortSignal.timeout(45000),
  });
}

