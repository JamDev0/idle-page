/**
 * POST /api/media/prefetch — prefetch remote media by item ids (spec §8.2).
 * Uses prefetchConcurrency (default 2) and remoteCacheLimitMb (default 2048) as server defaults.
 */
import { NextRequest } from "next/server";
import { prefetchItemsById } from "@/lib/media/prefetch";

const DEFAULT_CONCURRENCY = 2;
const DEFAULT_CACHE_LIMIT_MB = 2048;

export async function POST(request: NextRequest) {
  let body: { itemIds?: string[] } = {};
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

  const { prefetched, failed } = await prefetchItemsById(ids, {
    concurrency: DEFAULT_CONCURRENCY,
    remoteCacheLimitMb: DEFAULT_CACHE_LIMIT_MB,
  });

  return Response.json({ prefetched, failed }, { status: 200 });
}
