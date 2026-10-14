import { getSessionCookie } from "@/lib/auth";
import { BACKEND_URL } from "@/lib/constants";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  let token: string | undefined;

  try {
    token = await getSessionCookie();
  } catch {
    // Session token retrieval failed
  }

  if (!token) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { searchParams } = new URL(request.url);
  const clientId = searchParams.get("clientId") || "";

  const backendUrl = `${BACKEND_URL}/sync?clientId=${encodeURIComponent(clientId)}`;

  try {
    const upstreamRes = await fetch(backendUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "text/event-stream",
        "x-client-id": clientId,
      },
      // Pass client abort signal to cancel upstream when browser closes tab
      signal: request.signal,
    });

    if (!upstreamRes.ok || !upstreamRes.body) {
      return new Response(
        JSON.stringify({
          error: "Failed to establish real-time sync connection",
          status: upstreamRes.status,
        }),
        {
          status: upstreamRes.status,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    return new Response(upstreamRes.body, {
      status: 200,
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (error: unknown) {
    if (error instanceof Error && error.name === "AbortError") {
      return new Response(null, { status: 499 });
    }

    return new Response(
      JSON.stringify({
        error: "Internal sync proxy error",
        message: error instanceof Error ? error.message : String(error),
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}

