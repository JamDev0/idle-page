"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  loadSettings,
  MEDIA_REGISTRY_CHANGED_EVENT,
  saveSettings,
} from "@/lib/settings-storage";
import type { Settings } from "@/types/settings";
import type { RotationMode } from "@/types/settings";
import type { MediaItem } from "@/types/media";

const ROTATION_MODES: { value: RotationMode; label: string }[] = [
  { value: "random", label: "Random" },
  { value: "playlist", label: "Playlist" },
];

type CheckpointStatus =
  | { state: "idle" }
  | { state: "loading" }
  | { state: "ok"; message: string }
  | { state: "unsupported"; reason: string };

type MediaImportStatus =
  | { state: "idle" }
  | { state: "loading" }
  | { state: "ok"; count: number }
  | { state: "error"; message: string };

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>(() => loadSettings());
  const [saved, setSaved] = useState(false);
  const [checkpointStatus, setCheckpointStatus] = useState<CheckpointStatus>({
    state: "idle",
  });
  const [mediaImportStatus, setMediaImportStatus] =
    useState<MediaImportStatus>({ state: "idle" });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [remoteUrl, setRemoteUrl] = useState("");
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [mediaLoading, setMediaLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [quoteText, setQuoteText] = useState("");
  const [quoteSource, setQuoteSource] = useState("");
  const [quoteStatus, setQuoteStatus] = useState<MediaImportStatus>({ state: "idle" });

  const fetchMedia = useCallback(async () => {
    setMediaLoading(true);
    try {
      const res = await fetch("/api/media");
      const data = (await res.json()) as { items?: MediaItem[] };
      setMediaItems(data.items ?? []);
    } catch {
      setMediaItems([]);
    }
    setMediaLoading(false);
  }, []);

  useEffect(() => {
    fetchMedia();
    const handleRegistryChange = () => fetchMedia();
    window.addEventListener(MEDIA_REGISTRY_CHANGED_EVENT, handleRegistryChange);
    return () => window.removeEventListener(MEDIA_REGISTRY_CHANGED_EVENT, handleRegistryChange);
  }, [fetchMedia]);

  const handleSave = useCallback(() => {
    saveSettings(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }, [settings]);

  const handleCheckpoint = useCallback(async () => {
    const path = settings.todoFilePath?.trim();
    if (!path) {
      setCheckpointStatus({
        state: "unsupported",
        reason: "Set a TODO file path first.",
      });
      setTimeout(() => setCheckpointStatus({ state: "idle" }), 4000);
      return;
    }
    setCheckpointStatus({ state: "loading" });
    try {
      const url = `/api/todo/checkpoint?filePath=${encodeURIComponent(path)}`;
      const res = await fetch(url, { method: "POST" });
      const data = (await res.json()) as
        | { checkpoint: "ok"; message?: string }
        | { checkpoint: "unsupported"; reason?: string };
      if (data.checkpoint === "ok") {
        setCheckpointStatus({
          state: "ok",
          message: data.message ?? "Checkpoint saved.",
        });
      } else {
        setCheckpointStatus({
          state: "unsupported",
          reason: data.reason ?? "Checkpoint not available.",
        });
      }
    } catch {
      setCheckpointStatus({
        state: "unsupported",
        reason: "Request failed.",
      });
    }
    setTimeout(() => setCheckpointStatus({ state: "idle" }), 4000);
  }, [settings.todoFilePath]);

  const handleUploadFiles = useCallback(async () => {
    const input = fileInputRef.current;
    if (!input?.files?.length) {
      setMediaImportStatus({
        state: "error",
        message: "Select one or more files first.",
      });
      setTimeout(() => setMediaImportStatus({ state: "idle" }), 4000);
      return;
    }
    setMediaImportStatus({ state: "loading" });
    try {
      const formData = new FormData();
      for (let i = 0; i < input.files.length; i++) {
        const file = input.files[i];
        if (file) formData.append("files", file);
      }
      const res = await fetch("/api/media/upload", {
        method: "POST",
        body: formData,
      });
      const data = (await res.json()) as
        | { items?: unknown[] }
        | { error?: string; rejected?: { name: string; reason: string }[] };
      if (!res.ok) {
        const err =
          "error" in data && typeof data.error === "string"
            ? data.error
            : "Upload failed";
        const rejected =
          "rejected" in data && Array.isArray(data.rejected)
            ? data.rejected.map((r) => `${r.name}: ${r.reason}`).join("; ")
            : "";
        setMediaImportStatus({
          state: "error",
          message: rejected ? `${err}. ${rejected}` : err,
        });
      } else {
        const count = "items" in data && Array.isArray(data.items) ? data.items.length : 0;
        setMediaImportStatus({ state: "ok", count });
        window.dispatchEvent(new CustomEvent(MEDIA_REGISTRY_CHANGED_EVENT));
      }
      input.value = "";
    } catch {
      setMediaImportStatus({ state: "error", message: "Request failed." });
    }
    setTimeout(() => setMediaImportStatus({ state: "idle" }), 4000);
  }, []);

  const handleAddByUrl = useCallback(async () => {
    const url = remoteUrl.trim();
    if (!url) {
      setMediaImportStatus({
        state: "error",
        message: "Enter a URL first.",
      });
      setTimeout(() => setMediaImportStatus({ state: "idle" }), 4000);
      return;
    }
    setMediaImportStatus({ state: "loading" });
    try {
      const res = await fetch("/api/media", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: [{ source: "remote", uri: url }],
        }),
      });
      const data = (await res.json()) as
        | { items?: unknown[] }
        | { error?: string };
      if (!res.ok) {
        setMediaImportStatus({
          state: "error",
          message:
            "error" in data && typeof data.error === "string"
              ? data.error
              : "Add failed.",
        });
      } else {
        setMediaImportStatus({ state: "ok", count: 1 });
        setRemoteUrl("");
        window.dispatchEvent(new CustomEvent(MEDIA_REGISTRY_CHANGED_EVENT));
      }
    } catch {
      setMediaImportStatus({ state: "error", message: "Request failed." });
    }
    setTimeout(() => setMediaImportStatus({ state: "idle" }), 4000);
  }, [remoteUrl]);

  const handleDeleteMedia = useCallback(async (id: string) => {
    setDeleteId(id);
    try {
      const res = await fetch(`/api/media?id=${encodeURIComponent(id)}`, { method: "DELETE" });
      if (res.ok) {
        setMediaItems((items) => items.filter((i) => i.id !== id));
        window.dispatchEvent(new CustomEvent(MEDIA_REGISTRY_CHANGED_EVENT));
      }
    } catch {
      // Ignore errors
    }
    setDeleteId(null);
  }, []);

  const handleAddQuote = useCallback(async () => {
    const text = quoteText.trim();
    if (!text) {
      setQuoteStatus({ state: "error", message: "Enter a quote." });
      setTimeout(() => setQuoteStatus({ state: "idle" }), 4000);
      return;
    }
    setQuoteStatus({ state: "loading" });
    try {
      const res = await fetch("/api/media", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: [{ source: "inline", uri: "", title: text, attribution: quoteSource.trim() || undefined }],
        }),
      });
      const data = (await res.json()) as { items?: unknown[] } | { error?: string };
      if (!res.ok) {
        setQuoteStatus({
          state: "error",
          message: "error" in data && typeof data.error === "string" ? data.error : "Add failed.",
        });
      } else {
        setQuoteStatus({ state: "ok", count: 1 });
        setQuoteText("");
        setQuoteSource("");
        window.dispatchEvent(new CustomEvent(MEDIA_REGISTRY_CHANGED_EVENT));
      }
    } catch {
      setQuoteStatus({ state: "error", message: "Request failed." });
    }
    setTimeout(() => setQuoteStatus({ state: "idle" }), 4000);
  }, [quoteText, quoteSource]);

  return (
    <main className="min-h-screen bg-neutral-950 p-6 text-neutral-100">
      <div className="mx-auto max-w-lg">
        <h1 className="mb-6 text-xl font-medium">Settings</h1>
        <div className="space-y-4">
          <div>
            <label htmlFor="todoFilePath" className="mb-1 block text-sm text-neutral-400">
              TODO file path
            </label>
            <input
              id="todoFilePath"
              type="text"
              value={settings.todoFilePath}
              onChange={(e) => setSettings((s) => ({ ...s, todoFilePath: e.target.value }))}
              placeholder="/data/TO-DO.md"
              className="w-full rounded border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm"
            />
            <p className="mt-1 text-xs text-neutral-500">
              Absolute path to your markdown checklist file.
            </p>
          </div>
          <div>
            <label htmlFor="rotationMode" className="mb-1 block text-sm text-neutral-400">
              Media rotation
            </label>
            <select
              id="rotationMode"
              value={settings.rotationMode}
              onChange={(e) =>
                setSettings((s) => ({
                  ...s,
                  rotationMode: e.target.value as RotationMode,
                }))
              }
              className="w-full rounded border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm"
            >
              {ROTATION_MODES.map((v) => (
                <option key={v.value} value={v.value}>
                  {v.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="prefetchConcurrency" className="mb-1 block text-sm text-neutral-400">
              Prefetch concurrency
            </label>
            <input
              id="prefetchConcurrency"
              type="number"
              min={1}
              max={4}
              value={settings.prefetchConcurrency}
              onChange={(e) => {
                const v = parseInt(e.target.value, 10);
                if (!Number.isNaN(v) && v >= 1 && v <= 4) {
                  setSettings((s) => ({ ...s, prefetchConcurrency: v }));
                }
              }}
              className="w-20 rounded border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label htmlFor="remoteCacheLimitMb" className="mb-1 block text-sm text-neutral-400">
              Remote cache limit (MB)
            </label>
            <input
              id="remoteCacheLimitMb"
              type="number"
              min={256}
              max={4096}
              value={settings.remoteCacheLimitMb}
              onChange={(e) => {
                const v = parseInt(e.target.value, 10);
                if (!Number.isNaN(v) && v >= 256 && v <= 4096) {
                  setSettings((s) => ({ ...s, remoteCacheLimitMb: v }));
                }
              }}
              className="w-24 rounded border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={settings.showCompleted}
                onChange={(e) => setSettings((s) => ({ ...s, showCompleted: e.target.checked }))}
                className="rounded border-neutral-600"
              />
              <span className="text-sm">Show completed tasks</span>
            </label>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleSave}
              className="rounded bg-neutral-800 px-4 py-2 text-sm hover:bg-neutral-700"
            >
              Save
            </button>
            {saved && <span className="text-sm text-neutral-400">Saved.</span>}
          </div>

          <div className="border-t border-neutral-800 pt-4">
            <h2 className="mb-2 text-sm font-medium">Media Library</h2>
            {mediaLoading ? (
              <p className="text-xs text-neutral-500">Loading...</p>
            ) : mediaItems.length === 0 ? (
              <p className="text-xs text-neutral-500">No media items. Add some below.</p>
            ) : (
              <ul className="max-h-64 space-y-2 overflow-y-auto">
                {mediaItems.map((item) => (
                  <li key={item.id} className="flex items-center gap-2 rounded border border-neutral-800 bg-neutral-900/50 px-3 py-2">
                    <span className="shrink-0 rounded bg-neutral-700 px-1.5 py-0.5 text-[10px] uppercase">
                      {item.type}
                    </span>
                    <span className="flex-1 truncate text-xs text-neutral-300">
                      {item.type === "quote" ? (item.title ?? "—") : item.uri.split("/").pop() ?? item.uri}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDeleteMedia(item.id)}
                      disabled={deleteId === item.id}
                      className="shrink-0 rounded px-2 py-1 text-xs text-red-400 hover:bg-red-900/30 disabled:opacity-50"
                    >
                      {deleteId === item.id ? "..." : "Remove"}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="border-t border-neutral-800 pt-4">
            <h2 className="mb-2 text-sm font-medium">Add media</h2>
            <p className="mb-2 text-xs text-neutral-500">
              Upload files or add a remote URL.
            </p>
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".jpg,.jpeg,.png,.gif,.webp,.avif,.svg,.mp4,.webm,.ogg,.mov"
                className="text-sm text-neutral-400 file:mr-2 file:rounded file:border-0 file:bg-neutral-800 file:px-3 file:py-1.5 file:text-sm file:text-neutral-100"
              />
              <button
                type="button"
                onClick={handleUploadFiles}
                disabled={mediaImportStatus.state === "loading"}
                className="rounded bg-neutral-800 px-4 py-2 text-sm hover:bg-neutral-700 disabled:opacity-50"
              >
                Upload
              </button>
            </div>
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <input
                type="url"
                value={remoteUrl}
                onChange={(e) => setRemoteUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="min-w-[200px] flex-1 rounded border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm"
              />
              <button
                type="button"
                onClick={handleAddByUrl}
                disabled={mediaImportStatus.state === "loading"}
                className="rounded bg-neutral-800 px-4 py-2 text-sm hover:bg-neutral-700 disabled:opacity-50"
              >
                Add URL
              </button>
            </div>
            {mediaImportStatus.state === "ok" && (
              <p className="text-sm text-neutral-400">
                Added {mediaImportStatus.count} item{mediaImportStatus.count !== 1 ? "s" : ""}.
              </p>
            )}
            {mediaImportStatus.state === "error" && (
              <p className="text-sm text-red-400" role="alert">{mediaImportStatus.message}</p>
            )}
          </div>

          <div className="border-t border-neutral-800 pt-4">
            <h2 className="mb-2 text-sm font-medium">Add quote</h2>
            <div className="mb-3">
              <label htmlFor="quoteText" className="mb-1 block text-xs text-neutral-400">
                Quote
              </label>
              <textarea
                id="quoteText"
                value={quoteText}
                onChange={(e) => setQuoteText(e.target.value)}
                placeholder="The only way to do great work is to love what you do."
                rows={2}
                className="w-full rounded border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm"
              />
            </div>
            <div className="mb-3">
              <label htmlFor="quoteSource" className="mb-1 block text-xs text-neutral-400">
                Source (optional)
              </label>
              <input
                id="quoteSource"
                type="text"
                value={quoteSource}
                onChange={(e) => setQuoteSource(e.target.value)}
                placeholder="Steve Jobs"
                className="w-full rounded border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm"
              />
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleAddQuote}
                disabled={quoteStatus.state === "loading"}
                className="rounded bg-neutral-800 px-4 py-2 text-sm hover:bg-neutral-700 disabled:opacity-50"
              >
                {quoteStatus.state === "loading" ? "Adding..." : "Add Quote"}
              </button>
              {quoteStatus.state === "ok" && (
                <span className="text-sm text-neutral-400">Quote added.</span>
              )}
              {quoteStatus.state === "error" && (
                <span className="text-sm text-red-400">{quoteStatus.message}</span>
              )}
            </div>
          </div>

          <div className="border-t border-neutral-800 pt-4">
            <h2 className="mb-2 text-sm font-medium">Checkpoint (Git commit)</h2>
            <div className="mb-4 flex flex-col gap-2">
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={settings.autoCheckpoint}
                  onChange={(e) => setSettings((s) => ({ ...s, autoCheckpoint: e.target.checked }))}
                  className="rounded border-neutral-600"
                />
                <span className="text-sm">Auto-checkpoint (debounced)</span>
              </label>
              {settings.autoCheckpoint && (
                <div className="flex items-center gap-2">
                  <label htmlFor="checkpointDebounceSec" className="text-xs text-neutral-400">
                    Debounce (seconds)
                  </label>
                  <input
                    id="checkpointDebounceSec"
                    type="number"
                    min={1}
                    max={120}
                    value={settings.checkpointDebounceSec}
                    onChange={(e) => {
                      const v = parseInt(e.target.value, 10);
                      if (!Number.isNaN(v) && v >= 1 && v <= 120) {
                        setSettings((s) => ({ ...s, checkpointDebounceSec: v }));
                      }
                    }}
                    className="w-16 rounded border border-neutral-800 bg-neutral-900 px-2 py-1 text-sm"
                  />
                </div>
              )}
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleCheckpoint}
                disabled={checkpointStatus.state === "loading"}
                className="rounded bg-neutral-800 px-4 py-2 text-sm hover:bg-neutral-700 disabled:opacity-50"
              >
                {checkpointStatus.state === "loading" ? "Checkpointing…" : "Checkpoint"}
              </button>
              {checkpointStatus.state === "ok" && (
                <span className="text-sm text-neutral-400">{checkpointStatus.message}</span>
              )}
              {checkpointStatus.state === "unsupported" && (
                <span className="text-sm text-neutral-400">{checkpointStatus.reason}</span>
              )}
            </div>
          </div>
        </div>
        <p className="mt-8">
          <Link href="/" className="text-sm text-neutral-400 underline hover:text-neutral-100">
            &larr; Back
          </Link>
        </p>
      </div>
    </main>
  );
}
