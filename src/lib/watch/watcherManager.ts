/**
 * Per-path TODO watcher manager: one watcher per file path, broadcast to SSE subscribers (spec §8.1).
 */
import type { WatcherHealth } from "./todoWatcher";
import { createTodoWatcher } from "./todoWatcher";

export type StreamEvent = { type: "change" } | { type: "health"; status: WatcherHealth; message?: string };

type SendFn = (event: StreamEvent) => void;

interface PathState {
  closeWatcher: () => void;
  subscribers: Set<SendFn>;
}

const pathStates = new Map<string, PathState>();
const UNSUBSCRIBE_DELAY_MS = 3000;

function getOrCreatePathState(filePath: string): PathState {
  let state = pathStates.get(filePath);
  if (state) return state;

  const subscribers = new Set<SendFn>();

  const closeWatcher = createTodoWatcher(filePath, {
    onChange: () => {
      subscribers.forEach((send) => send({ type: "change" }));
    },
    onHealthChange: (status, message) => {
      subscribers.forEach((send) => send({ type: "health", status, message }));
    },
  }).close;

  state = { closeWatcher, subscribers };
  pathStates.set(filePath, state);
  return state;
}

let unsubscribeTimer: ReturnType<typeof setTimeout> | null = null;

function scheduleUnsubscribeCheck() {
  if (unsubscribeTimer) return;
  unsubscribeTimer = setTimeout(() => {
    unsubscribeTimer = null;
    for (const [path, state] of pathStates.entries()) {
      if (state.subscribers.size === 0) {
        state.closeWatcher();
        pathStates.delete(path);
      }
    }
  }, UNSUBSCRIBE_DELAY_MS);
}

/**
 * Subscribe to file change and health events for a path.
 * Returns an unsubscribe function.
 */
export function subscribeTodoStream(filePath: string, send: SendFn): () => void {
  const state = getOrCreatePathState(filePath);
  state.subscribers.add(send);
  // Send initial health so client knows we're watching
  send({ type: "health", status: "watching" });

  return () => {
    state.subscribers.delete(send);
    scheduleUnsubscribeCheck();
  };
}
