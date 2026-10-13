import { routeHandlerFetch } from "@/lib/api/fetchers";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams.toString();
  return routeHandlerFetch(`/transactions${searchParams ? `?${searchParams}` : ""}`);
}

