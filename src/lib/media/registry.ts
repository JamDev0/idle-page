/**
 * Media registry: read/write media-registry.json under media base path (spec §6.2, §8.2).
 * Warns for large local files per spec §11.4 (defensive soft limits).
 */
import { mkdir, readFile, stat, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { getMediaBasePath, normalizeMediaPath } from "@/lib/fs/hostPath";
import { deleteCachedFile } from "@/lib/media/cache";
import type { MediaItem, MediaSource, MediaType } from "@/types/media";

const REGISTRY_FILENAME = "media-registry.json";

function getRegistryPath(): string {
  return path.join(getMediaBasePath(), REGISTRY_FILENAME);
}

export interface MediaRegistry {
  items: MediaItem[];
}

const DEFAULT_REGISTRY: MediaRegistry = { items: [] };

function generateId(): string {
  return `media-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function inferTypeFromUri(uri: string): MediaType {
  const lower = uri.toLowerCase();
  if (lower.endsWith(".gif")) return "gif";
  if (
    [".mp4", ".webm", ".ogg", ".mov"].some((ext) => lower.endsWith(ext))
  )
    return "video";
  if (
    [".jpg", ".jpeg", ".png", ".webp", ".avif", ".svg"].some((ext) =>
      lower.endsWith(ext)
    )
  )
    return "image";
  return "image";
}

export async function readMediaRegistry(): Promise<MediaRegistry> {
  const filePath = getRegistryPath();
  let raw: string;
  try {
    raw = await readFile(filePath, "utf-8");
  } catch (err) {
    const code =
      err && typeof err === "object" && "code" in err
        ? (err as NodeJS.ErrnoException).code
        : undefined;
    if (code === "ENOENT") return DEFAULT_REGISTRY;
    throw err;
  }
  try {
    const parsed = JSON.parse(raw) as MediaRegistry;
    if (!parsed || !Array.isArray(parsed.items)) return DEFAULT_REGISTRY;
    return {
      items: parsed.items.filter(
        (item): item is MediaItem =>
          item &&
          typeof item.id === "string" &&
          typeof item.uri === "string" &&
          typeof item.type === "string" &&
          typeof item.source === "string" &&
          typeof item.status === "string"
      ),
    };
  } catch {
    return DEFAULT_REGISTRY;
  }
}

export async function writeMediaRegistry(registry: MediaRegistry): Promise<void> {
  const filePath = getRegistryPath();
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, JSON.stringify(registry, null, 2), "utf-8");
}

/** Soft limit (bytes) above which local files get a warning (spec §11.4). */
const LARGE_FILE_WARNING_BYTES = 50 * 1024 * 1024; // 50 MB

export interface AddMediaItemsOptions {
  /** Override for tests; when set, local files over this size get a warning. */
  largeFileWarningBytes?: number;
}

export interface ImportItemInput {
  type?: MediaType;
  source: MediaSource;
  uri: string;
  title?: string;
  attribution?: string;
  durationHintMs?: number;
}

function formatLargeFileWarning(sizeBytes: number): string {
  const mb = (sizeBytes / (1024 * 1024)).toFixed(1);
  return `Large file (${mb} MB); may affect performance.`;
}

export async function addMediaItems(
  inputs: ImportItemInput[],
  options?: AddMediaItemsOptions
): Promise<MediaItem[]> {
  const threshold =
    options?.largeFileWarningBytes ?? LARGE_FILE_WARNING_BYTES;
  const registry = await readMediaRegistry();
  const added: MediaItem[] = [];
  for (const input of inputs) {
    let uri = input.uri.trim();
    let warning: string | undefined;
    if (input.source === "local") {
      const resolved = normalizeMediaPath(uri);
      if (!resolved) continue;
      uri = resolved;
      try {
        const st = await stat(resolved);
        if (st.size > threshold) {
          warning = formatLargeFileWarning(st.size);
        }
      } catch {
        // stat failed (e.g. missing file); item still added, status ready; asset route will fail when served
      }
    }
    const type =
      input.type ?? (input.source === "inline" ? "quote" : inferTypeFromUri(uri));
    const item: MediaItem = {
      id: generateId(),
      type,
      source: input.source,
      uri,
      title: input.title?.trim(),
      attribution: input.attribution?.trim(),
      durationHintMs: input.durationHintMs,
      status: "ready",
      ...(warning && { warning }),
    };
    registry.items.push(item);
    added.push(item);
  }
  await writeMediaRegistry(registry);
  return added;
}

/**
 * Returns the resolved absolute path for a local media item, or null if not local or invalid.
 */
export function resolveLocalUri(uri: string): string | null {
  if (!uri || uri.startsWith("http://") || uri.startsWith("https://") || uri.startsWith("data:"))
    return null;
  return normalizeMediaPath(uri);
}

/**
 * Check whether a path is under media base (for serving).
 */
export function isPathUnderMediaBase(filePath: string): boolean {
  const base = path.resolve(getMediaBasePath());
  const resolved = path.resolve(filePath);
  return resolved.startsWith(base);
}

export async function removeMediaItem(id: string): Promise<MediaItem | null> {
  const registry = await readMediaRegistry();
  const index = registry.items.findIndex((item) => item.id === id);
  if (index === -1) return null;

  const item = registry.items[index];

  if (item.source === "local") {
    try {
      await unlink(item.uri);
    } catch {
      // File may not exist
    }
  } else if (item.source === "remote") {
    await deleteCachedFile(item.uri);
  }

  registry.items.splice(index, 1);
  await writeMediaRegistry(registry);
  return item;
}
