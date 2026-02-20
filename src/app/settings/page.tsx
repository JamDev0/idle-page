/**
 * Path and behavior settings (spec §6.2, frontend-design/components.md §2.7).
 */
"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { loadSettings, saveSettings } from "@/lib/settings-storage";
import type { Settings } from "@/types/settings";
import type { DesignVariant } from "@/types/settings";

const DESIGN_VARIANTS: { value: DesignVariant; label: string }[] = [
  { value: "void-minimal", label: "Void Minimal" },
  { value: "glass-ambient", label: "Glass Ambient" },
];

type CheckpointStatus =
  | { state: "idle" }
  | { state: "loading" }
  | { state: "ok"; message: string }
  | { state: "unsupported"; reason: string };

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>(() => loadSettings());
  const [saved, setSaved] = useState(false);
  const [checkpointStatus, setCheckpointStatus] = useState<CheckpointStatus>({
    state: "idle",
  });

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

  return (
    <main className="min-h-screen bg-[var(--bg)] p-6 text-[var(--fg)]">
      <div className="mx-auto max-w-lg">
        <h1 className="mb-6 text-xl font-medium">Settings</h1>
        <div className="space-y-4">
          <div>
            <label
              htmlFor="todoFilePath"
              className="mb-1 block text-sm text-[var(--muted)]"
            >
              TODO file path
            </label>
            <input
              id="todoFilePath"
              type="text"
              value={settings.todoFilePath}
              onChange={(e) =>
                setSettings((s) => ({ ...s, todoFilePath: e.target.value }))
              }
              placeholder="/data/TO-DO.md"
              className="w-full rounded border border-[#262626] bg-[#0f0f0f] px-3 py-2 text-sm"
              aria-describedby="todoFilePathHelp"
            />
            <p id="todoFilePathHelp" className="mt-1 text-xs text-[var(--muted)]">
              Absolute path to your markdown checklist file (e.g. in Docker:
              /data/TO-DO.md).
            </p>
          </div>
          <div>
            <label
              htmlFor="designVariant"
              className="mb-1 block text-sm text-[var(--muted)]"
            >
              Design variant
            </label>
            <select
              id="designVariant"
              value={settings.designVariant}
              onChange={(e) =>
                setSettings((s) => ({
                  ...s,
                  designVariant: e.target.value as DesignVariant,
                }))
              }
              className="w-full rounded border border-[#262626] bg-[#0f0f0f] px-3 py-2 text-sm"
              aria-describedby="designVariantHelp"
            >
              {DESIGN_VARIANTS.map((v) => (
                <option key={v.value} value={v.value}>
                  {v.label}
                </option>
              ))}
            </select>
            <p id="designVariantHelp" className="mt-1 text-xs text-[var(--muted)]">
              Void Minimal: subdued panel bottom-left. Glass Ambient: frosted panel bottom-right.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleSave}
              className="rounded bg-[#262626] px-4 py-2 text-sm hover:bg-[#333]"
            >
              Save
            </button>
            {saved && (
              <span className="text-sm text-[var(--muted)]">Saved.</span>
            )}
          </div>
          <div className="border-t border-[#262626] pt-4">
            <h2 className="mb-2 text-sm font-medium text-[var(--fg)]">
              Checkpoint (Git commit)
            </h2>
            <p className="mb-2 text-xs text-[var(--muted)]">
              Attempt a git commit for the TODO file path above. Only works when
              the path is inside a git repo.
            </p>
            <div className="mb-4 flex flex-col gap-2">
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={settings.autoCheckpoint}
                  onChange={(e) =>
                    setSettings((s) => ({ ...s, autoCheckpoint: e.target.checked }))
                  }
                  className="rounded border-[#404040]"
                />
                <span className="text-sm text-[var(--fg)]">
                  Auto-checkpoint (debounced after edits)
                </span>
              </label>
              {settings.autoCheckpoint && (
                <div className="flex items-center gap-2">
                  <label
                    htmlFor="checkpointDebounceSec"
                    className="text-xs text-[var(--muted)]"
                  >
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
                    className="w-16 rounded border border-[#262626] bg-[#0f0f0f] px-2 py-1 text-sm"
                  />
                </div>
              )}
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleCheckpoint}
                disabled={checkpointStatus.state === "loading"}
                className="rounded bg-[#262626] px-4 py-2 text-sm hover:bg-[#333] disabled:opacity-50"
              >
                {checkpointStatus.state === "loading"
                  ? "Checkpointing…"
                  : "Checkpoint"}
              </button>
              {checkpointStatus.state === "ok" && (
                <span className="text-sm text-[var(--muted)]">
                  {checkpointStatus.message}
                </span>
              )}
              {checkpointStatus.state === "unsupported" && (
                <span className="text-sm text-[var(--muted)]">
                  {checkpointStatus.reason}
                </span>
              )}
            </div>
          </div>
        </div>
        <p className="mt-8">
          <Link
            href="/"
            className="text-sm text-[var(--muted)] underline hover:text-[var(--fg)]"
          >
            ← Back to Idle Page
          </Link>
        </p>
      </div>
    </main>
  );
}
