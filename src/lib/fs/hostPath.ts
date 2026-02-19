/**
 * Path normalization and validation for TODO file and media (spec §6.2).
 * Ensures paths are safe for server-side file access.
 */
import path from "node:path";

const IDLE_ID_PREFIX = "idle-id:";

/** Base path for allowed TODO files (e.g. /data in Docker). Defaults to process.cwd() if unset. */
function getAllowedBase(): string {
  return process.env.TODO_BASE_PATH ?? process.cwd();
}

/** Base path for media registry and local files (e.g. /data in Docker). Defaults to process.cwd() if unset. */
export function getMediaBasePath(): string {
  return process.env.MEDIA_BASE_PATH ?? process.cwd();
}

/**
 * Resolves a path under media base. Returns null if outside base or invalid.
 */
export function normalizeMediaPath(filePath: string): string | null {
  if (!filePath || typeof filePath !== "string") return null;
  const trimmed = filePath.trim();
  if (!trimmed) return null;
  const base = path.resolve(getMediaBasePath());
  const resolved = path.isAbsolute(trimmed) ? path.resolve(trimmed) : path.resolve(base, trimmed);
  if (!resolved.startsWith(base)) return null;
  return resolved;
}

/**
 * Normalizes and validates a user-provided TODO file path.
 * Resolves relative to allowed base; returns null if outside base or invalid.
 */
export function normalizeTodoFilePath(filePath: string): string | null {
  if (!filePath || typeof filePath !== "string") return null;
  const trimmed = filePath.trim();
  if (!trimmed) return null;
  const base = path.resolve(getAllowedBase());
  const resolved = path.isAbsolute(trimmed) ? path.resolve(trimmed) : path.resolve(base, trimmed);
  if (!resolved.startsWith(base)) return null;
  return resolved;
}

export { IDLE_ID_PREFIX };
