/**
 * GET /api/media/health — cache and media health (spec §8.2).
 * Optional query: remoteCacheLimitMb (256–4096) to match user settings.
 */
import { NextRequest } from "next/server";
import { getCacheHealth } from "@/lib/media/prefetch";

const DEFAULT_CACHE_LIMIT_MB = 2048;
const MIN_CACHE_MB = 256;
const MAX_CACHE_MB = 4096;

function clampCacheMb(n: number): number {
  return Math.min(MAX_CACHE_MB, Math.max(MIN_CACHE_MB, Math.floor(n)));
}

export async function GET(request: NextRequest) {
  const raw = request.nextUrl.searchParams.get("remoteCacheLimitMb");
  const remoteCacheLimitMb =
    raw != null && raw !== ""
      ? clampCacheMb(Number(raw))
      : DEFAULT_CACHE_LIMIT_MB;
  const health = await getCacheHealth(remoteCacheLimitMb);
  return Response.json(health, { status: 200 });
}
