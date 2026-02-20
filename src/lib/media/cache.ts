/**
 * Remote media cache: disk store with 2GB cap and LRU eviction (spec §11.2, §11.3).
 */
import { createHash } from "node:crypto";
import { mkdir, readFile, rename, stat, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { getMediaBasePath } from "@/lib/fs/hostPath";

const CACHE_DIR_NAME = "remote-cache";
const MANIFEST_FILENAME = "manifest.json";
const MAX_FETCH_ATTEMPTS = 2;

const ALLOWED_SCHEMES = ["https:", "http:"];

function getCacheDir(): string {
  return path.join(getMediaBasePath(), CACHE_DIR_NAME);
}

function getManifestPath(): string {
  return path.join(getCacheDir(), MANIFEST_FILENAME);
}

/**
 * Only allow http/https URLs to prevent SSRF (spec §14).
 */
export function isAllowedRemoteUrl(url: string): boolean {
  if (!url || typeof url !== "string") return false;
  const trimmed = url.trim();
  try {
    const u = new URL(trimmed);
    return ALLOWED_SCHEMES.includes(u.protocol);
  } catch {
    return false;
  }
}

function urlToCacheKey(url: string): string {
  const hash = createHash("sha256").update(url, "utf-8").digest("hex").slice(0, 24);
  const ext = path.extname(new URL(url).pathname).toLowerCase() || ".bin";
  const safeExt = /^\.([a-z0-9]+)$/i.test(ext) ? ext : ".bin";
  return `${hash}${safeExt}`;
}

export interface CacheManifestEntry {
  path: string;
  size: number;
  lastAccessed: number;
}

export interface CacheManifest {
  entries: Record<string, CacheManifestEntry>;
}

const DEFAULT_MANIFEST: CacheManifest = { entries: {} };

async function readManifest(): Promise<CacheManifest> {
  const filePath = getManifestPath();
  let raw: string;
  try {
    raw = await readFile(filePath, "utf-8");
  } catch (err) {
    const code =
      err && typeof err === "object" && "code" in err
        ? (err as NodeJS.ErrnoException).code
        : undefined;
    if (code === "ENOENT") return { ...DEFAULT_MANIFEST };
    throw err;
  }
  try {
    const parsed = JSON.parse(raw) as CacheManifest;
    if (!parsed || typeof parsed.entries !== "object") return { ...DEFAULT_MANIFEST };
    return { entries: { ...parsed.entries } };
  } catch {
    return { ...DEFAULT_MANIFEST };
  }
}

async function writeManifest(manifest: CacheManifest): Promise<void> {
  const dir = getCacheDir();
  await mkdir(dir, { recursive: true });
  await writeFile(getManifestPath(), JSON.stringify(manifest, null, 2), "utf-8");
}

/**
 * Returns the absolute path of the cached file for url, or null if not cached or missing.
 */
export async function getCachedPath(url: string): Promise<string | null> {
  if (!isAllowedRemoteUrl(url)) return null;
  const manifest = await readManifest();
  const entry = manifest.entries[url];
  if (!entry || typeof entry.path !== "string" || typeof entry.size !== "number") return null;
  try {
    const st = await stat(entry.path);
    if (!st.isFile()) return null;
    return entry.path;
  } catch {
    return null;
  }
}

/**
 * Evict LRU entries until total size is at or below limitBytes.
 */
async function evictIfNeeded(
  manifest: CacheManifest,
  limitBytes: number,
  currentTotal: number
): Promise<{ manifest: CacheManifest; freed: number }> {
  if (currentTotal <= limitBytes) return { manifest, freed: 0 };
  const sorted = Object.entries(manifest.entries).sort(
    (a, b) => a[1].lastAccessed - b[1].lastAccessed
  );
  let freed = 0;
  const nextEntries = { ...manifest.entries };
  for (const [url, entry] of sorted) {
    if (currentTotal - freed <= limitBytes) break;
    try {
      await unlink(entry.path);
      freed += entry.size;
      delete nextEntries[url];
    } catch {
      delete nextEntries[url];
    }
  }
  return { manifest: { entries: nextEntries }, freed };
}

export interface CacheStats {
  sizeBytes: number;
  count: number;
  limitBytes: number;
}

/**
 * Get current cache size and entry count. limitBytes should be passed from settings (remoteCacheLimitMb * 1024 * 1024).
 */
export async function getCacheStats(limitMb: number): Promise<CacheStats> {
  const manifest = await readManifest();
  let sizeBytes = 0;
  let count = 0;
  for (const entry of Object.values(manifest.entries)) {
    try {
      const st = await stat(entry.path);
      if (st.isFile()) {
        sizeBytes += entry.size;
        count += 1;
      }
    } catch {
      // skip missing files
    }
  }
  const limitBytes = Math.max(0, limitMb) * 1024 * 1024;
  return { sizeBytes, count, limitBytes };
}

/**
 * Fetch remote URL and store in cache. Retries up to MAX_FETCH_ATTEMPTS then throws (spec: retry then skip).
 * Caller should catch and treat as failed prefetch.
 * limitBytes: cache size limit in bytes (e.g. remoteCacheLimitMb * 1024 * 1024).
 */
export async function fetchAndCache(
  url: string,
  limitBytes: number,
  options?: { signal?: AbortSignal }
): Promise<string> {
  if (!isAllowedRemoteUrl(url)) {
    throw new Error("Invalid or disallowed URL scheme");
  }
  const dir = getCacheDir();
  await mkdir(dir, { recursive: true });
  const key = urlToCacheKey(url);
  const cachedPath = path.join(dir, key);

  let lastErr: Error | null = null;
  for (let attempt = 1; attempt <= MAX_FETCH_ATTEMPTS; attempt++) {
    try {
      const res = await fetch(url, {
        signal: options?.signal,
        redirect: "follow",
        headers: { "User-Agent": "IdlePage/1.0" },
      });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const blob = await res.blob();
      const buf = Buffer.from(await blob.arrayBuffer());
      const tempPath = path.join(dir, `${key}.tmp.${Date.now()}`);
      await writeFile(tempPath, buf);
      await rename(tempPath, cachedPath);
      const size = buf.length;
      const manifest = await readManifest();
      const now = Date.now();
      const entries = { ...manifest.entries, [url]: { path: cachedPath, size, lastAccessed: now } };
      let totalSize = size;
      for (const e of Object.values(manifest.entries)) {
        if (e.path !== cachedPath) totalSize += e.size;
      }
      const { manifest: afterEvict } = await evictIfNeeded({ entries }, limitBytes, totalSize);
      await writeManifest(afterEvict);
      return cachedPath;
    } catch (err) {
      lastErr = err instanceof Error ? err : new Error(String(err));
    }
  }
  throw lastErr ?? new Error("Fetch failed");
}

/**
 * Ensure cache directory and manifest exist; optionally run eviction to enforce limit.
 */
export async function ensureCacheLimit(limitMb: number): Promise<CacheStats> {
  const limitBytes = Math.max(0, limitMb) * 1024 * 1024;
  const manifest = await readManifest();
  let totalSize = 0;
  const validEntries: Record<string, CacheManifestEntry> = {};
  for (const [url, entry] of Object.entries(manifest.entries)) {
    try {
      const st = await stat(entry.path);
      if (st.isFile()) {
        validEntries[url] = entry;
        totalSize += entry.size;
      }
    } catch {
      // skip missing
    }
  }
  const { manifest: afterEvict } = await evictIfNeeded(
    { entries: validEntries },
    limitBytes,
    totalSize
  );
  await writeManifest(afterEvict);
  return getCacheStats(limitMb);
}

export async function deleteCachedFile(url: string): Promise<boolean> {
  if (!isAllowedRemoteUrl(url)) return false;
  const manifest = await readManifest();
  const entry = manifest.entries[url];
  if (!entry) return false;
  try {
    await unlink(entry.path);
  } catch {
    // File may not exist
  }
  const nextEntries = { ...manifest.entries };
  delete nextEntries[url];
  await writeManifest({ entries: nextEntries });
  return true;
}
