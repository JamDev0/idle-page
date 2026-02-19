/**
 * GET /api/media/asset?id= — serve local media file by id (spec §8.2).
 * Returns 404 for remote/inline or invalid id; streams file for local.
 */
import { NextRequest } from "next/server";
import { createReadStream } from "node:fs";
import { Readable } from "node:stream";
import { stat } from "node:fs/promises";
import path from "node:path";
import {
  isPathUnderMediaBase,
  readMediaRegistry,
  resolveLocalUri,
} from "@/lib/media/registry";

const ID_PARAM = "id";

export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get(ID_PARAM);
  if (!id) {
    return Response.json({ error: "Missing id" }, { status: 400 });
  }

  const registry = await readMediaRegistry();
  const item = registry.items.find((i) => i.id === id);
  if (!item) {
    return new Response(null, { status: 404 });
  }

  if (item.source !== "local") {
    return new Response(null, { status: 404 });
  }

  const resolved = resolveLocalUri(item.uri);
  if (!resolved || !isPathUnderMediaBase(resolved)) {
    return new Response(null, { status: 404 });
  }

  try {
    const st = await stat(resolved);
    if (!st.isFile()) {
      return new Response(null, { status: 404 });
    }
  } catch {
    return new Response(null, { status: 404 });
  }

  const ext = path.extname(resolved).toLowerCase();
  const mime: Record<string, string> = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".gif": "image/gif",
    ".webp": "image/webp",
    ".avif": "image/avif",
    ".svg": "image/svg+xml",
    ".mp4": "video/mp4",
    ".webm": "video/webm",
    ".ogg": "video/ogg",
    ".mov": "video/quicktime",
  };
  const contentType = mime[ext] ?? "application/octet-stream";

  const nodeStream = createReadStream(resolved);
  const webStream = Readable.toWeb(nodeStream) as ReadableStream<Uint8Array>;
  return new Response(webStream, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "private, max-age=3600",
    },
  });
}
