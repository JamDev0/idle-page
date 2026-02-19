/**
 * GET /api/media/health — cache and media health (spec §8.2).
 */
import { getCacheHealth } from "@/lib/media/prefetch";

const DEFAULT_CACHE_LIMIT_MB = 2048;

export async function GET() {
  const health = await getCacheHealth(DEFAULT_CACHE_LIMIT_MB);
  return Response.json(health, { status: 200 });
}
