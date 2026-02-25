"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  loadSettings,
  MEDIA_REGISTRY_CHANGED_EVENT,
  SETTINGS_CHANGED_EVENT,
} from "@/lib/settings-storage";
import type { MediaItem, MediaHealthResponse } from "@/types/media";
import type { RotationMode } from "@/types/settings";

const MEDIA_API = "/api/media";
const HEALTH_POLL_MS = 60_000;
const MEDIA_AUTO_ADVANCE_MS = 12_000;
const QUOTE_AUTO_ADVANCE_MS = 8_000;

function pickRandomIndex(length: number, excludeIndex: number) {
  if (length <= 1) return 0;
  const idx = Math.floor(Math.random() * length);
  return idx === excludeIndex ? (excludeIndex + 1) % length : idx;
}

export function mediaSrc(item: MediaItem) {
  if (item.source === "local" || item.source === "remote") {
    return `/api/media/asset?id=${encodeURIComponent(item.id)}`;
  }
  return item.uri;
}

export function useMedia() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [history, setHistory] = useState<number[]>([]);
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [rotationMode, setRotationMode] = useState<RotationMode>("playlist");
  const [loading, setLoading] = useState(true);
  const [mediaHealth, setMediaHealth] = useState<MediaHealthResponse | null>(null);
  const [prefetchFailedBanner, setPrefetchFailedBanner] = useState(false);
  const [mediaHealthBannerDismissed, setMediaHealthBannerDismissed] = useState(false);

  useEffect(() => {
    setRotationMode(loadSettings().rotationMode);
  }, []);

  useEffect(() => {
    const handler = () => setRotationMode(loadSettings().rotationMode);
    window.addEventListener(SETTINGS_CHANGED_EVENT, handler);
    return () => window.removeEventListener(SETTINGS_CHANGED_EVENT, handler);
  }, []);

  const refetchMedia = useCallback(() => {
    setLoading(true);
    fetch(MEDIA_API)
      .then((res) => res.json())
      .then((data: { items?: MediaItem[] }) => {
        const list = Array.isArray(data?.items) ? data.items : [];
        setItems(list);
        setCurrentIndex(0);
        setHistory([]);
        setQuoteIndex(0);
      })
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { refetchMedia(); }, [refetchMedia]);

  useEffect(() => {
    const handler = () => refetchMedia();
    window.addEventListener(MEDIA_REGISTRY_CHANGED_EVENT, handler);
    return () => window.removeEventListener(MEDIA_REGISTRY_CHANGED_EVENT, handler);
  }, [refetchMedia]);

  const visualItems = useMemo(
    () => items.filter((item) => item.type === "image" || item.type === "gif" || item.type === "video"),
    [items],
  );
  const quoteItems = useMemo(() => items.filter((item) => item.type === "quote"), [items]);

  const playbackItems = useMemo(() => {
    if (visualItems.length === 0) return quoteItems;
    if (rotationMode !== "random" || visualItems.length <= 1) return visualItems;
    return [...visualItems];
  }, [visualItems, quoteItems, rotationMode]);

  const currentItem: MediaItem | null =
    playbackItems.length > 0 ? playbackItems[currentIndex % playbackItems.length] ?? null : null;
  const concurrentQuote: MediaItem | null =
    visualItems.length > 0 && quoteItems.length > 0
      ? quoteItems[quoteIndex % quoteItems.length] ?? null
      : null;

  useEffect(() => {
    if (quoteItems.length === 0) {
      setQuoteIndex(0);
      return;
    }
    setQuoteIndex((prev) => prev % quoteItems.length);
  }, [quoteItems.length]);

  const fetchMediaHealth = useCallback(() => {
    const s = loadSettings();
    const remoteCacheLimitMb = s.remoteCacheLimitMb ?? 2048;
    const url = `/api/media/health?remoteCacheLimitMb=${encodeURIComponent(remoteCacheLimitMb)}`;
    fetch(url)
      .then((res) => res.json())
      .then((data: MediaHealthResponse) => {
        if (data && typeof data.status === "string") {
          setMediaHealth({
            status: data.status,
            cacheSizeBytes: typeof data.cacheSizeBytes === "number" ? data.cacheSizeBytes : 0,
            cacheLimitBytes: typeof data.cacheLimitBytes === "number" ? data.cacheLimitBytes : 0,
          });
        }
      })
      .catch(() => setMediaHealth(null));
  }, []);

  useEffect(() => {
    if (items.length === 0) { setMediaHealth(null); return; }
    fetchMediaHealth();
    const id = setInterval(fetchMediaHealth, HEALTH_POLL_MS);
    return () => clearInterval(id);
  }, [items.length, fetchMediaHealth]);

  useEffect(() => {
    if (visualItems.length === 0 || playbackItems.length === 0) return;
    const s = loadSettings();
    const concurrency = Math.max(1, s.prefetchConcurrency ?? 2);
    const nextIndices: number[] = [];
    for (let i = 1; i <= concurrency; i++) {
      nextIndices.push((currentIndex + i) % playbackItems.length);
    }
    const nextIds = nextIndices
      .map((i) => playbackItems[i]?.id)
      .filter((id): id is string => typeof id === "string");
    if (nextIds.length === 0) return;
    const remoteCacheLimitMb = s.remoteCacheLimitMb ?? 2048;
    fetch("/api/media/prefetch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemIds: nextIds, preferredConcurrency: concurrency, remoteCacheLimitMb }),
    })
      .then((res) => res.json())
      .then((data: { prefetched?: string[]; failed?: string[] }) => {
        const failed = Array.isArray(data?.failed) ? data.failed : [];
        if (failed.length > 0) setPrefetchFailedBanner(true);
      })
      .catch(() => {});
  }, [playbackItems, currentIndex, visualItems.length]);

  const goNext = useCallback(() => {
    if (playbackItems.length === 0) return;
    if (rotationMode === "playlist") {
      setHistory((h) => [...h, currentIndex]);
      setCurrentIndex((i) => (i + 1) % playbackItems.length);
    } else {
      setHistory((h) => [...h, currentIndex]);
      setCurrentIndex(pickRandomIndex(playbackItems.length, currentIndex));
    }
  }, [playbackItems.length, rotationMode, currentIndex]);

  const goPrev = useCallback(() => {
    if (playbackItems.length === 0) return;
    if (rotationMode === "playlist") {
      setCurrentIndex((i) => (playbackItems.length + i - 1) % playbackItems.length);
    } else if (history.length > 0) {
      const prevIndex = history[history.length - 1];
      setCurrentIndex(prevIndex);
      setHistory((h) => h.slice(0, -1));
    }
  }, [playbackItems.length, rotationMode, history]);

  const showCacheDegradedBanner = mediaHealth?.status === "degraded" && !mediaHealthBannerDismissed;

  // Auto-advance non-video media and quote-only playback.
  useEffect(() => {
    if (!currentItem || playbackItems.length <= 1) return;
    if (currentItem.type === "video") return;
    const id = setTimeout(() => {
      goNext();
    }, MEDIA_AUTO_ADVANCE_MS);
    return () => clearTimeout(id);
  }, [currentItem, playbackItems.length, goNext]);

  // When visual media is present, rotate quote overlay independently.
  useEffect(() => {
    if (visualItems.length === 0 || quoteItems.length <= 1) return;
    const id = setInterval(() => {
      setQuoteIndex((idx) => (idx + 1) % quoteItems.length);
    }, QUOTE_AUTO_ADVANCE_MS);
    return () => clearInterval(id);
  }, [visualItems.length, quoteItems.length]);

  return {
    items,
    visualItems,
    quoteItems,
    playbackItems,
    concurrentQuote,
    currentItem,
    currentIndex,
    loading,
    goNext,
    goPrev,
    mediaHealth,
    showCacheDegradedBanner,
    prefetchFailedBanner,
    setPrefetchFailedBanner,
    setMediaHealthBannerDismissed,
  };
}
