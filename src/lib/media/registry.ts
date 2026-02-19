/**
 * Media registry: read/write media-registry.json under media base path (spec §6.2, §8.2).
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { getMediaBasePath, normalizeMediaPath } from "@/lib/fs/hostPath";
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

export interface ImportItemInput {
  type?: MediaType;
  source: MediaSource;
  uri: string;
  title?: string;
  durationHintMs?: number;
}

export async function addMediaItems(
  inputs: ImportItemInput[]
): Promise<MediaItem[]> {
  const registry = await readMediaRegistry();
  const added: MediaItem[] = [];
  for (const input of inputs) {
    let uri = input.uri.trim();
    if (input.source === "local") {
      const resolved = normalizeMediaPath(uri);
      if (!resolved) continue;
      uri = resolved;
    }
    const type =
      input.type ?? (input.source === "inline" ? "quote" : inferTypeFromUri(uri));
    const item: MediaItem = {
      id: generateId(),
      type,
      source: input.source,
      uri,
      title: input.title?.trim(),
      durationHintMs: input.durationHintMs,
      status: "ready",
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
