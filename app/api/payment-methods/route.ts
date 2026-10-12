import { routeHandlerFetch } from "@/lib/api/fetchers";

export async function GET() {
  return routeHandlerFetch("/payment-methods");
}
