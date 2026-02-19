"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { loadSettings } from "@/lib/settings-storage";
import type { Task } from "@/types/task";
import type { TodoFileHealth, TodoParseResult } from "@/types/task";
import type { WatcherHealth } from "@/lib/watch/todoWatcher";

const API_BASE = "/api/todo";

function query(filePath: string): string {
  return `?filePath=${encodeURIComponent(filePath)}`;
}

export function TodoPanel() {
  const [filePath, setFilePath] = useState("");
  const [data, setData] = useState<TodoParseResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [newText, setNewText] = useState("");
  const [watcherHealth, setWatcherHealth] = useState<WatcherHealth | null>(null);
  const [watcherMessage, setWatcherMessage] = useState<string | null>(null);

  const fetchTasks = useCallback(async (path: string) => {
    if (!path.trim()) {
      setData(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}${query(path)}`);
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Request failed");
        setData(null);
        return;
      }
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const s = loadSettings();
    setFilePath(s.todoFilePath);
    if (s.todoFilePath) fetchTasks(s.todoFilePath);
  }, [fetchTasks]);

  // SSE stream for file changes and watcher health (spec §8.1, §10.2)
  useEffect(() => {
    if (!filePath.trim()) {
      setWatcherHealth(null);
      setWatcherMessage(null);
      return;
    }
    const url = `${API_BASE}/stream${query(filePath)}`;
    const es = new EventSource(url);

    es.addEventListener("change", () => {
      fetchTasks(filePath);
    });

    es.addEventListener("health", (e: MessageEvent) => {
      try {
        const payload = JSON.parse(e.data) as { status: WatcherHealth; message?: string };
        setWatcherHealth(payload.status);
        setWatcherMessage(payload.message ?? null);
      } catch {
        setWatcherHealth(null);
        setWatcherMessage(null);
      }
    });

    es.onerror = () => {
      es.close();
      setWatcherHealth("degraded");
      setWatcherMessage("Live updates disconnected. Use manual refresh.");
    };

    return () => {
      es.close();
      setWatcherHealth(null);
      setWatcherMessage(null);
    };
  }, [filePath, fetchTasks]);

  const handleAdd = useCallback(async () => {
    const text = newText.trim();
    if (!text || !filePath) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}${query(filePath)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Create failed");
        return;
      }
      setNewText("");
      await fetchTasks(filePath);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Create failed");
    } finally {
      setLoading(false);
    }
  }, [filePath, newText, fetchTasks]);

  const handleToggle = useCallback(
    async (task: Task) => {
      if (!filePath) return;
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE}/${encodeURIComponent(task.id)}${query(filePath)}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ checked: !task.checked }),
        });
        const json = await res.json();
        if (!res.ok) {
          setError(json.error ?? "Update failed");
          return;
        }
        await fetchTasks(filePath);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Update failed");
      } finally {
        setLoading(false);
      }
    },
    [filePath, fetchTasks]
  );

  const handleSaveEdit = useCallback(
    async (id: string) => {
      if (!filePath) return;
      const text = editText.trim();
      setEditingId(null);
      setEditText("");
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE}/${encodeURIComponent(id)}${query(filePath)}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text }),
        });
        if (!res.ok) {
          const json = await res.json();
          setError(json.error ?? "Update failed");
          return;
        }
        await fetchTasks(filePath);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Update failed");
      } finally {
        setLoading(false);
      }
    },
    [filePath, editText, fetchTasks]
  );

  const handleDelete = useCallback(
    async (id: string) => {
      if (!filePath) return;
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE}/${encodeURIComponent(id)}${query(filePath)}`, {
          method: "DELETE",
        });
        if (!res.ok) {
          const json = await res.json();
          setError(json.error ?? "Delete failed");
          return;
        }
        await fetchTasks(filePath);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Delete failed");
      } finally {
        setLoading(false);
      }
    },
    [filePath, fetchTasks]
  );

  const handleReorder = useCallback(
    async (orderedTaskIds: string[]) => {
      if (!filePath) return;
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE}/reorder${query(filePath)}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderedTaskIds }),
        });
        const json = await res.json();
        if (!res.ok) {
          setError(json.reason ?? json.error ?? "Reorder failed");
          return;
        }
        setData(json);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Reorder failed");
      } finally {
        setLoading(false);
      }
    },
    [filePath]
  );

  const moveUp = useCallback(
    (index: number) => {
      const list = data?.tasks ?? [];
      if (index <= 0 || index >= list.length) return;
      const next = [...list.slice(0, index - 1), list[index], list[index - 1], ...list.slice(index + 1)];
      handleReorder(next.map((t) => t.id));
    },
    [data?.tasks, handleReorder]
  );

  const moveDown = useCallback(
    (index: number) => {
      const list = data?.tasks ?? [];
      if (index < 0 || index >= list.length - 1) return;
      const next = [...list.slice(0, index), list[index + 1], list[index], ...list.slice(index + 2)];
      handleReorder(next.map((t) => t.id));
    },
    [data?.tasks, handleReorder]
  );

  const startEdit = useCallback((task: Task) => {
    setEditingId(task.id);
    setEditText(task.text);
  }, []);

  const showCompleted = loadSettings().showCompleted;
  const tasks = data?.tasks ?? [];
  const visibleTasks = showCompleted
    ? tasks
    : tasks.filter((t) => !t.checked);
  const health = data?.fileHealth ?? null;
  const isDegraded = health && health !== "ok" && health !== "missing";
  const isWatcherDegraded =
    watcherHealth === "degraded" || watcherHealth === "retrying";

  const indexInFullList = (task: Task) => tasks.findIndex((t) => t.id === task.id);
  const canMoveUp = (task: Task) => indexInFullList(task) > 0;
  const canMoveDown = (task: Task) => {
    const i = indexInFullList(task);
    return i >= 0 && i < tasks.length - 1;
  };

  return (
    <aside
      className="idle-todo-panel absolute z-10 rounded-lg px-6 py-4"
      style={{
        backgroundColor: "var(--color-panel-bg)",
        border: "1px solid var(--color-panel-border)",
        boxShadow: "var(--shadow-panel)",
        backdropFilter: "blur(var(--blur-panel))",
        WebkitBackdropFilter: "blur(var(--blur-panel))",
      }}
      aria-label="TODO checklist"
    >
      <h2 className="mb-2 text-sm font-medium text-[var(--muted)]">TODO</h2>

      {!filePath.trim() ? (
        <p className="text-sm text-[var(--muted)]">
          <Link href="/settings" className="underline hover:text-[var(--fg)]">
            Select TODO file path
          </Link>{" "}
          in settings.
        </p>
      ) : (
        <>
          {isWatcherDegraded && (
            <p className="mb-2 text-sm text-amber-500" role="alert">
              {watcherMessage ?? (watcherHealth === "retrying" ? "Watcher retrying…" : "Watcher unavailable.")}
            </p>
          )}
          {isDegraded && (
            <p className="mb-2 text-sm text-amber-500" role="alert">
              File: {health}. {data?.parseWarnings?.join(" ") ?? ""}
            </p>
          )}
          {error && (
            <p className="mb-2 text-sm text-red-400" role="alert">
              {error}
            </p>
          )}
          {loading && (
            <p className="mb-2 text-sm text-[var(--muted)]">Loading…</p>
          )}
          <ul className="space-y-1 text-sm">
            {visibleTasks.map((task) => (
              <li
                key={task.id}
                className="flex items-center gap-2"
                style={task.checked ? { opacity: "var(--opacity-task-completed)" } : undefined}
              >
                <button
                  type="button"
                  onClick={() => handleToggle(task)}
                  aria-label={task.checked ? "Mark incomplete" : "Mark complete"}
                  className="shrink-0 rounded border border-[#404040] bg-transparent px-1.5 py-0.5 text-xs"
                >
                  {task.checked ? "✓" : "○"}
                </button>
                {editingId === task.id ? (
                  <>
                    <input
                      type="text"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSaveEdit(task.id);
                        if (e.key === "Escape") {
                          setEditingId(null);
                          setEditText("");
                        }
                      }}
                      className="min-w-0 flex-1 rounded border border-[#404040] bg-[#0f0f0f] px-2 py-1"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => handleSaveEdit(task.id)}
                      className="shrink-0 text-xs text-[var(--muted)] hover:text-[var(--fg)]"
                    >
                      Save
                    </button>
                  </>
                ) : (
                  <>
                    <span
                      className={`min-w-0 flex-1 ${task.checked ? "line-through text-[var(--muted)]" : ""}`}
                    >
                      {task.text || "(empty)"}
                    </span>
                    <button
                      type="button"
                      onClick={() => moveUp(indexInFullList(task))}
                      disabled={!canMoveUp(task) || loading}
                      aria-label="Move up"
                      className="shrink-0 text-xs text-[var(--muted)] hover:text-[var(--fg)] disabled:opacity-40"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      onClick={() => moveDown(indexInFullList(task))}
                      disabled={!canMoveDown(task) || loading}
                      aria-label="Move down"
                      className="shrink-0 text-xs text-[var(--muted)] hover:text-[var(--fg)] disabled:opacity-40"
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      onClick={() => startEdit(task)}
                      className="shrink-0 text-xs text-[var(--muted)] hover:text-[var(--fg)]"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(task.id)}
                      aria-label="Delete task"
                      className="shrink-0 text-xs text-[var(--muted)] hover:text-red-400"
                    >
                      Delete
                    </button>
                  </>
                )}
              </li>
            ))}
          </ul>
          <div className="mt-3 flex gap-2">
            <input
              type="text"
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              placeholder="New task…"
              className="min-w-0 flex-1 rounded border border-[#404040] bg-[#0f0f0f] px-2 py-1.5 text-sm"
            />
            <button
              type="button"
              onClick={handleAdd}
              disabled={!newText.trim() || loading}
              className="shrink-0 rounded bg-[#262626] px-3 py-1.5 text-sm hover:bg-[#333] disabled:opacity-50"
            >
              Add
            </button>
          </div>
          <p className="mt-2 text-xs text-[var(--muted)]">
            <Link href="/settings" className="underline hover:text-[var(--fg)]">
              Settings
            </Link>
          </p>
        </>
      )}
    </aside>
  );
}
