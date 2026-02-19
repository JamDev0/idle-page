"use client";

import type { MediaItem } from "@/types/media";

interface MediaViewerProps {
  item: MediaItem | null;
  onNext: () => void;
}

function mediaSrc(item: MediaItem): string {
  if (item.source === "local" || item.source === "remote") {
    return `/api/media/asset?id=${encodeURIComponent(item.id)}`;
  }
  return item.uri;
}

export function MediaViewer({ item, onNext }: MediaViewerProps) {
  if (!item) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-[var(--muted)]">
        <p>No media. Add items in settings or via import.</p>
      </div>
    );
  }

  if (item.type === "quote") {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center px-8 text-center">
        <blockquote className="text-xl italic text-[var(--fg)]">
          {(item.title ?? item.uri) || "—"}
        </blockquote>
        {item.title && item.uri && (
          <cite className="mt-4 text-sm text-[var(--muted)]">{item.uri}</cite>
        )}
      </div>
    );
  }

  if (item.type === "video") {
    const src = mediaSrc(item);
    return (
      <div className="relative flex min-h-[40vh] w-full items-center justify-center">
        <video
          key={item.id}
          className="max-h-[80vh] max-w-full object-contain"
          src={src}
          controls={false}
          autoPlay
          muted
          playsInline
          onEnded={onNext}
        />
      </div>
    );
  }

  if (item.type === "image" || item.type === "gif") {
    const src = mediaSrc(item);
    return (
      <div className="flex min-h-[40vh] w-full items-center justify-center">
        <img
          key={item.id}
          className="max-h-[80vh] max-w-full object-contain"
          src={src}
          alt={item.title ?? ""}
        />
      </div>
    );
  }

  return (
    <div className="flex min-h-[40vh] items-center justify-center text-[var(--muted)]">
      <p>Unknown type: {item.type}</p>
    </div>
  );
}
