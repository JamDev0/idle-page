/**
 * GET /api/todo/stream — SSE for file change events and watcher health (spec §8.1).
 */
import { NextRequest } from "next/server";
import { normalizeTodoFilePath } from "@/lib/fs/hostPath";
import { subscribeTodoStream } from "@/lib/watch/watcherManager";

const FILE_PATH_PARAM = "filePath";

function formatSSE(event: string, data: string): string {
  return `event: ${event}\ndata: ${data}\n\n`;
}

export async function GET(request: NextRequest) {
  const filePathParam = request.nextUrl.searchParams.get(FILE_PATH_PARAM);
  const filePath = filePathParam ? normalizeTodoFilePath(filePathParam) : null;

  if (!filePath) {
    return Response.json(
      { error: "Missing or invalid filePath" },
      { status: 400 }
    );
  }

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const encoder = new TextEncoder();
      const send = (event: { type: "change" } | { type: "health"; status: string; message?: string }) => {
        const eventName = event.type;
        const data = JSON.stringify(event);
        try {
          controller.enqueue(encoder.encode(formatSSE(eventName, data)));
        } catch {
          // Client may have disconnected
        }
      };

      const unsubscribe = subscribeTodoStream(filePath, send);

      request.signal.addEventListener(
        "abort",
        () => {
          unsubscribe();
          try {
            controller.close();
          } catch {
            // already closed
          }
        },
        { once: true }
      );
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-store, no-cache",
      Connection: "keep-alive",
    },
  });
}
