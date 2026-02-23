/**
 * Prefetch remote media with concurrency limit (spec §11.3: prefetch 2 ahead, concurrency 2).
 */
import { readMediaRegistry } from "@/lib/media/registry";
import {
  fetchAndCache,
  getCachedPath,
  getCacheStats,
  type CacheStats,
} from "@/lib/media/cache";
import type { MediaItem } from "@/types/media";

export interface PrefetchOptions {
  /** Max concurrent fetches (default 2 per spec). */
  concurrency: number;
  /** Cache size limit in MB (default 2048). */
  remoteCacheLimitMb: number;
  signal?: AbortSignal;
}

const DEFAULT_CONCURRENCY = 2;
const DEFAULT_CACHE_LIMIT_MB = 2048;

/**
 * Prefetch remote items by IDs: ensure each remote item is in cache (fetch if missing).
 * Runs at most `concurrency` fetches in parallel. Returns ids prefetched and failed.
 */
export async function prefetchItemsById(
  itemIds: string[],
  options?: Partial<PrefetchOptions>
): Promise<{ prefetched: string[]; failed: string[] }> {
  const concurrency = options?.concurrency ?? DEFAULT_CONCURRENCY;
  const limitMb = options?.remoteCacheLimitMb ?? DEFAULT_CACHE_LIMIT_MB;
  const limitBytes = limitMb * 1024 * 1024;

  const registry = await readMediaRegistry();
  const toFetch: { id: string; item: MediaItem }[] = [];
  for (const id of itemIds) {
    const item = registry.items.find((i) => i.id === id);
    if (!item || item.source !== "remote") continue;
    const cached = await getCachedPath(item.uri);
    if (!cached) toFetch.push({ id, item });
  }

  const prefetched: string[] = [];
  const failed: string[] = [];

  for (let i = 0; i < toFetch.length; i += concurrency) {
    const chunk = toFetch.slice(i, i + concurrency);
    const outcomes = await Promise.allSettled(
      chunk.map(async ({ id, item }) => {
        await fetchAndCache(item.uri, limitBytes, { signal: options?.signal });
        return id;
      })
    );
    for (let j = 0; j < outcomes.length; j++) {
      const o = outcomes[j];
      const id = chunk[j]?.id;
      if (!id) continue;
      if (o?.status === "fulfilled") prefetched.push(id);
      else failed.push(id);
    }
  }

  return { prefetched, failed };
}

/**
 * Get cache health for GET /api/media/health.
 */
export async function getCacheHealth(remoteCacheLimitMb: number) {
  const stats: CacheStats = await getCacheStats(remoteCacheLimitMb);
  const status = stats.sizeBytes > stats.limitBytes ? "degraded" : "ok";
  return {
    cacheSizeBytes: stats.sizeBytes,
    cacheLimitBytes: stats.limitBytes,
    status,
    count: stats.count,
  };
}
