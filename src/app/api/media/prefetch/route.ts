/**
 * POST /api/media/prefetch — prefetch remote media by item ids (spec §8.2).
 * Accepts optional preferredConcurrency (1–4) and remoteCacheLimitMb (256–4096) from client settings.
 */
import { NextRequest } from "next/server";
import { prefetchItemsById } from "@/lib/media/prefetch";

const DEFAULT_CONCURRENCY = 2;
const DEFAULT_CACHE_LIMIT_MB = 2048;
const MIN_CONCURRENCY = 1;
const MAX_CONCURRENCY = 4;
const MIN_CACHE_MB = 256;
const MAX_CACHE_MB = 4096;

interface PrefetchBody {
  itemIds?: string[];
  preferredConcurrency?: number;
  remoteCacheLimitMb?: number;
}

function clampConcurrency(n: number): number {
  return Math.min(MAX_CONCURRENCY, Math.max(MIN_CONCURRENCY, Math.floor(n)));
}

function clampCacheMb(n: number): number {
  return Math.min(MAX_CACHE_MB, Math.max(MIN_CACHE_MB, Math.floor(n)));
}

export async function POST(request: NextRequest) {
  let body: PrefetchBody = {};
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const itemIds = body.itemIds;
  if (!Array.isArray(itemIds)) {
    return Response.json(
      { error: "Body must include itemIds array" },
      { status: 400 }
    );
  }

  const ids = itemIds.filter(
    (id): id is string => typeof id === "string" && id.length > 0
  );

  const concurrency =
    typeof body.preferredConcurrency === "number"
      ? clampConcurrency(body.preferredConcurrency)
      : DEFAULT_CONCURRENCY;
  const remoteCacheLimitMb =
    typeof body.remoteCacheLimitMb === "number"
      ? clampCacheMb(body.remoteCacheLimitMb)
      : DEFAULT_CACHE_LIMIT_MB;

  const { prefetched, failed } = await prefetchItemsById(ids, {
    concurrency,
    remoteCacheLimitMb,
  });

  return Response.json({ prefetched, failed }, { status: 200 });
}
