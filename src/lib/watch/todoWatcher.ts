/**
 * TODO file watcher with retry and degraded mode (spec §6.2, §10.1, §10.2).
 * Chokidar wrapper: debounce, mtime/content check before broadcast, retry with backoff.
 */
import { createHash } from "node:crypto";
import { readFile, stat } from "node:fs/promises";
import chokidar, { type FSWatcher } from "chokidar";

/** Watcher health state for SSE and UI banner (spec §10.2). */
export type WatcherHealth = "watching" | "retrying" | "degraded";

export interface TodoWatcherCallbacks {
  onChange: () => void;
  onHealthChange: (status: WatcherHealth, message?: string) => void;
}

const DEBOUNCE_MS = 150;
const MAX_RETRIES = 4;
const INITIAL_BACKOFF_MS = 1000;
const MAX_BACKOFF_MS = 15000;

function backoffDelay(attempt: number): number {
  const d = INITIAL_BACKOFF_MS * Math.pow(2, attempt);
  return Math.min(d, MAX_BACKOFF_MS);
}

/**
 * Creates a file watcher for the given TODO path.
 * Debounces change events; compares mtime and content hash before calling onChange (spec §10.1).
 * On watcher errors, retries with backoff; after exhaustion enters degraded mode (spec §10.2).
 */
export function createTodoWatcher(
  filePath: string,
  callbacks: TodoWatcherCallbacks
): { close: () => void } {
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;
  let lastMtime: string | null = null;
  let lastHash: string | null = null;
  let retryCount = 0;
  let retryTimer: ReturnType<typeof setTimeout> | null = null;
  let closed = false;

  async function getMtimeAndHash(): Promise<{ mtime: string; hash: string } | null> {
    try {
      const [statResult, content] = await Promise.all([
        stat(filePath),
        readFile(filePath, "utf-8"),
      ]);
      const mtime = statResult.mtime.toISOString();
      const hash = createHash("sha256").update(content, "utf8").digest("hex").slice(0, 16);
      return { mtime, hash };
    } catch {
      return null;
    }
  }

  async function emitChangeIfDifferent() {
    const current = await getMtimeAndHash();
    if (current == null) return;
    if (lastMtime === current.mtime && lastHash === current.hash) return;
    lastMtime = current.mtime;
    lastHash = current.hash;
    callbacks.onChange();
  }

  function scheduleDebouncedChange() {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      debounceTimer = null;
      void emitChangeIfDifferent();
    }, DEBOUNCE_MS);
  }

  let currentWatcher: FSWatcher | null = null;

  function tryWatch() {
    if (closed) return;
    currentWatcher = chokidar.watch(filePath, {
      persistent: true,
      ignoreInitial: true,
      awaitWriteFinish: { stabilityThreshold: 50 },
    });

    currentWatcher.on("change", () => {
      if (closed) return;
      scheduleDebouncedChange();
    });

    currentWatcher.on("error", (err: unknown) => {
      const w = currentWatcher;
      currentWatcher = null;
      w?.close().catch(() => {});
      if (closed) return;
      retryCount += 1;
      const errMessage = err instanceof Error ? err.message : String(err);
      if (retryCount > MAX_RETRIES) {
        callbacks.onHealthChange(
          "degraded",
          `File watch failed after ${MAX_RETRIES} retries. Use manual refresh.`
        );
        return;
      }
      callbacks.onHealthChange(
        "retrying",
        `Watch error: ${errMessage}. Retrying (${retryCount}/${MAX_RETRIES})…`
      );
      const delay = backoffDelay(retryCount - 1);
      retryTimer = setTimeout(() => {
        retryTimer = null;
        tryWatch();
      }, delay);
    });

    callbacks.onHealthChange("watching");
    retryCount = 0;
  }

  tryWatch();

  return {
    close() {
      closed = true;
      if (debounceTimer) {
        clearTimeout(debounceTimer);
        debounceTimer = null;
      }
      if (retryTimer) {
        clearTimeout(retryTimer);
        retryTimer = null;
      }
      if (currentWatcher) {
        const w = currentWatcher;
        currentWatcher = null;
        w.close().catch(() => {});
      }
    },
  };
}
