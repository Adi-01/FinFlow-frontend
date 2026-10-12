import { routeHandlerFetch } from "@/lib/api/fetchers";
import type { NextRequest } from "next/server";

export async function GET() {
  return routeHandlerFetch("/profile");
}

export async function PATCH(request: NextRequest) {
  const body = await request.json();
  return routeHandlerFetch("/profile", {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}
