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
  const abortController = new AbortController();

  if (request.signal) {
    request.signal.addEventListener("abort", () => {
      abortController.abort();
    });
  }

  try {
    const upstreamRes = await fetch(backendUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "text/event-stream",
        "x-client-id": clientId,
      },
      signal: abortController.signal,
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

    // Pipe upstream stream through ReadableStream that aborts upstream fetch when client disconnects
    const stream = new ReadableStream({
      async start(controller) {
        const reader = upstreamRes.body!.getReader();
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) {
              controller.close();
              break;
            }
            controller.enqueue(value);
          }
        } catch (err) {
          controller.error(err);
        } finally {
          reader.releaseLock();
        }
      },
      cancel() {
        abortController.abort();
      },
    });

    return new Response(stream, {
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
