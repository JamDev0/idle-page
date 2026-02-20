"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { loadSettings, SETTINGS_CHANGED_EVENT } from "@/lib/settings-storage";
import { MediaViewer } from "@/components/MediaViewer";
import type { MediaItem } from "@/types/media";
import type { RotationMode } from "@/types/settings";

const MEDIA_API = "/api/media";

function pickRandomIndex(length: number, excludeIndex: number): number {
  if (length <= 1) return 0;
  const idx = Math.floor(Math.random() * length);
  return idx === excludeIndex ? (excludeIndex + 1) % length : idx;
}

export function MediaArea() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [history, setHistory] = useState<number[]>([]);
  const [rotationMode, setRotationMode] = useState<RotationMode>("playlist");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const s = loadSettings();
    setRotationMode(s.rotationMode);
  }, []);
  useEffect(() => {
    const handler = () => setRotationMode(loadSettings().rotationMode);
    window.addEventListener(SETTINGS_CHANGED_EVENT, handler);
    return () => window.removeEventListener(SETTINGS_CHANGED_EVENT, handler);
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(MEDIA_API)
      .then((res) => res.json())
      .then((data: { items?: MediaItem[] }) => {
        if (cancelled) return;
        const list = Array.isArray(data?.items) ? data.items : [];
        setItems(list);
        setCurrentIndex(0);
        setHistory([]);
      })
      .catch(() => {
        if (!cancelled) setItems([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const displayList = useMemo(() => {
    if (rotationMode !== "random" || items.length <= 1) return items;
    return [...items];
  }, [items, rotationMode]);

  const currentItem: MediaItem | null =
    displayList.length > 0 ? displayList[currentIndex % displayList.length] ?? null : null;

  // Prefetch next 2 items (spec §11.3) to keep transitions seamless
  useEffect(() => {
    if (displayList.length === 0) return;
    const s = loadSettings();
    const concurrency = Math.max(1, s.prefetchConcurrency ?? 2);
    const nextIndices: number[] = [];
    for (let i = 1; i <= concurrency; i++) {
      nextIndices.push((currentIndex + i) % displayList.length);
    }
    const nextIds = nextIndices
      .map((i) => displayList[i]?.id)
      .filter((id): id is string => typeof id === "string");
    if (nextIds.length === 0) return;
    const remoteCacheLimitMb = s.remoteCacheLimitMb ?? 2048;
    fetch("/api/media/prefetch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        itemIds: nextIds,
        preferredConcurrency: concurrency,
        remoteCacheLimitMb,
      }),
    }).catch(() => {});
  }, [displayList, currentIndex]);

  const goNext = useCallback(() => {
    if (displayList.length === 0) return;
    if (rotationMode === "playlist") {
      setHistory((h) => [...h, currentIndex]);
      setCurrentIndex((i) => (i + 1) % displayList.length);
    } else {
      setHistory((h) => [...h, currentIndex]);
      const next = pickRandomIndex(displayList.length, currentIndex);
      setCurrentIndex(next);
    }
  }, [displayList.length, rotationMode, currentIndex]);

  const goPrev = useCallback(() => {
    if (displayList.length === 0) return;
    if (rotationMode === "playlist") {
      setCurrentIndex((i) => (displayList.length + i - 1) % displayList.length);
    } else if (history.length > 0) {
      const prevIndex = history[history.length - 1];
      setCurrentIndex(prevIndex);
      setHistory((h) => h.slice(0, -1));
    }
  }, [displayList.length, rotationMode, history]);

  if (loading) {
    return (
      <section
        className="absolute inset-0 flex items-center justify-center bg-[var(--color-bg-base)]"
        aria-label="Media display"
      >
        <p className="text-[var(--muted)]">Loading media…</p>
      </section>
    );
  }

  return (
    <section
      className="absolute inset-0 flex flex-col bg-[var(--color-bg-base)]"
      aria-label="Media display"
    >
      <div className="flex flex-1 items-center justify-center">
        <MediaViewer item={currentItem} onNext={goNext} />
      </div>
      {/* Control chip: bottom-center, token-based (spec §12.2, tokens §3–4) */}
      <div
        className="idle-control-bar absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center justify-center gap-4"
        style={{
          backgroundColor: "var(--control-bg)",
          color: "var(--control-text)",
          borderRadius: "var(--radius-md)",
          padding: "var(--space-2) var(--space-4)",
          boxShadow: "var(--shadow-panel)",
        }}
      >
        <button
          type="button"
          onClick={goPrev}
          className="rounded px-4 py-2 text-sm hover:opacity-90"
          aria-label="Previous"
        >
          Prev
        </button>
        <button
          type="button"
          onClick={goNext}
          className="rounded px-4 py-2 text-sm hover:opacity-90"
          aria-label="Next"
        >
          Next
        </button>
      </div>
    </section>
  );
}
