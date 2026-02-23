/**
 * GET /api/media/asset?id= — serve media by id (spec §8.2).
 * Local: stream from disk. Remote: stream from cache (fetch-and-cache if missing).
 * Returns 404 for inline or invalid id.
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
import { getCachedPath, fetchAndCache, isAllowedRemoteUrl } from "@/lib/media/cache";

const ID_PARAM = "id";
const DEFAULT_CACHE_LIMIT_MB = 2048;

const MIME_BY_EXT: Record<string, string> = {
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

function contentTypeForPath(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  return MIME_BY_EXT[ext] ?? "application/octet-stream";
}

async function streamFileResponse(filePath: string): Promise<Response> {
  const nodeStream = createReadStream(filePath);
  const webStream = Readable.toWeb(nodeStream) as ReadableStream<Uint8Array>;
  return new Response(webStream, {
    status: 200,
    headers: {
      "Content-Type": contentTypeForPath(filePath),
      "Cache-Control": "private, max-age=3600",
    },
  });
}

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

  if (item.source === "local") {
    const resolved = resolveLocalUri(item.uri);
    if (!resolved || !isPathUnderMediaBase(resolved)) {
      return new Response(null, { status: 404 });
    }
    try {
      const st = await stat(resolved);
      if (!st.isFile()) return new Response(null, { status: 404 });
    } catch {
      return new Response(null, { status: 404 });
    }
    return streamFileResponse(resolved);
  }

  if (item.source === "remote" && isAllowedRemoteUrl(item.uri)) {
    const limitBytes = DEFAULT_CACHE_LIMIT_MB * 1024 * 1024;
    let cached = await getCachedPath(item.uri);
    if (!cached) {
      try {
        await fetchAndCache(item.uri, limitBytes);
        cached = await getCachedPath(item.uri);
      } catch {
        return new Response(null, { status: 502 });
      }
    }
    if (!cached) return new Response(null, { status: 502 });
    try {
      const st = await stat(cached);
      if (!st.isFile()) return new Response(null, { status: 404 });
    } catch {
      return new Response(null, { status: 404 });
    }
    return streamFileResponse(cached);
  }

  return new Response(null, { status: 404 });
}
