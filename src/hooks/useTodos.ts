"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { loadSettings, SETTINGS_CHANGED_EVENT } from "@/lib/settings-storage";
import type { Task } from "@/types/task";
import type { TodoFileHealth, TodoParseResult } from "@/types/task";
import type { WatcherHealth } from "@/lib/watch/todoWatcher";

const API_BASE = "/api/todo";

function query(filePath: string) {
  return `?filePath=${encodeURIComponent(filePath)}`;
}

export function useTodos() {
  const [filePath, setFilePath] = useState("");
  const [data, setData] = useState<TodoParseResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [newText, setNewText] = useState("");
  const [watcherHealth, setWatcherHealth] = useState<WatcherHealth | null>(null);
  const [watcherMessage, setWatcherMessage] = useState<string | null>(null);
  const [externalChangeBanner, setExternalChangeBanner] = useState<string | null>(null);
  const [, setSettingsVersion] = useState(0);
  const checkpointTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handler = () => setSettingsVersion((v) => v + 1);
    window.addEventListener(SETTINGS_CHANGED_EVENT, handler);
    return () => window.removeEventListener(SETTINGS_CHANGED_EVENT, handler);
  }, []);

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

  const scheduleCheckpoint = useCallback((path: string) => {
    const s = loadSettings();
    if (!s.autoCheckpoint || !path.trim()) return;
    if (checkpointTimeoutRef.current) clearTimeout(checkpointTimeoutRef.current);
    const delayMs = (s.checkpointDebounceSec ?? 10) * 1000;
    checkpointTimeoutRef.current = setTimeout(() => {
      checkpointTimeoutRef.current = null;
      fetch(`${API_BASE}/checkpoint${query(path)}`, { method: "POST" }).catch(() => {});
    }, delayMs);
  }, []);

  useEffect(() => {
    return () => {
      if (checkpointTimeoutRef.current) {
        clearTimeout(checkpointTimeoutRef.current);
        checkpointTimeoutRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const s = loadSettings();
    setFilePath(s.todoFilePath);
    if (s.todoFilePath) fetchTasks(s.todoFilePath);
  }, [fetchTasks]);

  const health = data?.fileHealth ?? null;
  const readOnly = health != null && health !== "ok";

  useEffect(() => {
    if (readOnly) {
      setEditingId(null);
      setEditText("");
    }
  }, [readOnly]);

  useEffect(() => {
    if (!filePath.trim()) {
      setWatcherHealth(null);
      setWatcherMessage(null);
      return;
    }
    const url = `${API_BASE}/stream${query(filePath)}`;
    const es = new EventSource(url);
    es.addEventListener("change", () => fetchTasks(filePath));
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
      setWatcherMessage("Live updates disconnected. Refreshing every 7s.");
    };
    return () => {
      es.close();
      setWatcherHealth(null);
      setWatcherMessage(null);
    };
  }, [filePath, fetchTasks]);

  const POLL_INTERVAL_MS = 7000;
  useEffect(() => {
    if (!filePath.trim()) return;
    if (watcherHealth !== "degraded" && watcherHealth !== "retrying") return;
    const id = setInterval(() => fetchTasks(filePath), POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [filePath, watcherHealth, fetchTasks]);

  const handleAdd = useCallback(async () => {
    const text = newText.trim();
    if (!text || !filePath) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}${query(filePath)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, lastModified: data?.lastModified }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Create failed");
        return;
      }
      if (json.externalChangeDetected) {
        setExternalChangeBanner("File was modified externally; your edit was applied.");
      }
      setNewText("");
      await fetchTasks(filePath);
      scheduleCheckpoint(filePath);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Create failed");
    } finally {
      setLoading(false);
    }
  }, [filePath, newText, data?.lastModified, fetchTasks, scheduleCheckpoint]);

  const handleToggle = useCallback(
    async (task: Task) => {
      if (!filePath) return;
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE}/${encodeURIComponent(task.id)}${query(filePath)}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ checked: !task.checked, lastModified: data?.lastModified }),
        });
        const json = await res.json();
        if (!res.ok) { setError(json.error ?? "Update failed"); return; }
        if (json.externalChangeDetected) {
          setExternalChangeBanner("File was modified externally; your edit was applied.");
        }
        await fetchTasks(filePath);
        scheduleCheckpoint(filePath);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Update failed");
      } finally {
        setLoading(false);
      }
    },
    [filePath, data?.lastModified, fetchTasks, scheduleCheckpoint],
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
          body: JSON.stringify({ text, lastModified: data?.lastModified }),
        });
        const json = await res.json();
        if (!res.ok) { setError(json.error ?? "Update failed"); return; }
        if (json.externalChangeDetected) {
          setExternalChangeBanner("File was modified externally; your edit was applied.");
        }
        await fetchTasks(filePath);
        scheduleCheckpoint(filePath);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Update failed");
      } finally {
        setLoading(false);
      }
    },
    [filePath, editText, data?.lastModified, fetchTasks, scheduleCheckpoint],
  );

  const handleDelete = useCallback(
    async (id: string) => {
      if (!filePath) return;
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE}/${encodeURIComponent(id)}${query(filePath)}`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lastModified: data?.lastModified }),
        });
        const json = await res.json();
        if (!res.ok) { setError(json.error ?? "Delete failed"); return; }
        if (json.externalChangeDetected) {
          setExternalChangeBanner("File was modified externally; your edit was applied.");
        }
        await fetchTasks(filePath);
        scheduleCheckpoint(filePath);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Delete failed");
      } finally {
        setLoading(false);
      }
    },
    [filePath, data?.lastModified, fetchTasks, scheduleCheckpoint],
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
          body: JSON.stringify({ orderedTaskIds, lastModified: data?.lastModified }),
        });
        const json = await res.json();
        if (!res.ok) { setError(json.reason ?? json.error ?? "Reorder failed"); return; }
        if (json.externalChangeDetected) {
          setExternalChangeBanner("File was modified externally; your edit was applied.");
        }
        await fetchTasks(filePath);
        scheduleCheckpoint(filePath);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Reorder failed");
      } finally {
        setLoading(false);
      }
    },
    [filePath, data?.lastModified, fetchTasks, scheduleCheckpoint],
  );

  const moveUp = useCallback(
    (index: number) => {
      const list = data?.tasks ?? [];
      if (index <= 0 || index >= list.length) return;
      const next = [...list.slice(0, index - 1), list[index], list[index - 1], ...list.slice(index + 1)];
      handleReorder(next.map((t) => t.id));
    },
    [data?.tasks, handleReorder],
  );

  const moveDown = useCallback(
    (index: number) => {
      const list = data?.tasks ?? [];
      if (index < 0 || index >= list.length - 1) return;
      const next = [...list.slice(0, index), list[index + 1], list[index], ...list.slice(index + 2)];
      handleReorder(next.map((t) => t.id));
    },
    [data?.tasks, handleReorder],
  );

  const startEdit = useCallback((task: Task) => {
    setEditingId(task.id);
    setEditText(task.text);
  }, []);

  const showCompleted = loadSettings().showCompleted;
  const tasks = data?.tasks ?? [];
  const visibleTasks = showCompleted ? tasks : tasks.filter((t) => !t.checked);
  const isDegraded = health && health !== "ok" && health !== "missing";
  const isWatcherDegraded = watcherHealth === "degraded" || watcherHealth === "retrying";
  const indexInFullList = (task: Task) => tasks.findIndex((t) => t.id === task.id);
  const canMoveUp = (task: Task) => indexInFullList(task) > 0;
  const canMoveDown = (task: Task) => {
    const i = indexInFullList(task);
    return i >= 0 && i < tasks.length - 1;
  };

  return {
    filePath,
    tasks,
    visibleTasks,
    loading,
    error,
    editingId,
    editText,
    setEditText,
    newText,
    setNewText,
    health,
    readOnly,
    isDegraded,
    isWatcherDegraded,
    watcherHealth,
    watcherMessage,
    externalChangeBanner,
    setExternalChangeBanner,
    handleAdd,
    handleToggle,
    handleSaveEdit,
    handleDelete,
    startEdit,
    setEditingId,
    moveUp,
    moveDown,
    indexInFullList,
    canMoveUp,
    canMoveDown,
    data,
  };
}
