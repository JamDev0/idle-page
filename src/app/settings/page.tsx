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

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>(() => loadSettings());
  const [saved, setSaved] = useState(false);

  const handleSave = useCallback(() => {
    saveSettings(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }, [settings]);

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
