"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { loadSettings } from "@/lib/settings-storage";
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
    fetch("/api/media/prefetch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemIds: nextIds }),
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
        className="flex min-h-[40vh] items-center justify-center bg-[#0f0f0f]"
        aria-label="Media display"
      >
        <p className="text-[var(--muted)]">Loading media…</p>
      </section>
    );
  }

  return (
    <section
      className="relative flex min-h-[40vh] flex-col bg-[#0f0f0f]"
      aria-label="Media display"
    >
      <div className="flex flex-1 items-center justify-center">
        <MediaViewer item={currentItem} onNext={goNext} />
      </div>
      <div className="flex items-center justify-center gap-4 border-t border-[var(--panel)] py-3">
        <button
          type="button"
          onClick={goPrev}
          className="rounded bg-[var(--panel)] px-4 py-2 text-sm text-[var(--fg)] hover:opacity-90"
          aria-label="Previous"
        >
          Prev
        </button>
        <button
          type="button"
          onClick={goNext}
          className="rounded bg-[var(--panel)] px-4 py-2 text-sm text-[var(--fg)] hover:opacity-90"
          aria-label="Next"
        >
          Next
        </button>
      </div>
    </section>
  );
}
