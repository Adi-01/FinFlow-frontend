import { routeHandlerFetch } from "@/lib/api/fetchers";
import type { NextRequest } from "next/server";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return routeHandlerFetch(`/categories/${id}`, {
    method: "DELETE",
  });
}
