import { NextRequest } from "next/server";
import { routeHandlerFetch } from "@/lib/api/fetchers";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const resolvedParams = await params;
  const { searchParams } = new URL(request.url);
  const queryString = searchParams.toString();
  const endpoint = `/${resolvedParams.path.join("/")}${queryString ? `?${queryString}` : ""}`;

  return routeHandlerFetch(endpoint);
}
