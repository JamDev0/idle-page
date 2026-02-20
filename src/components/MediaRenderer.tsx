"use client";

import type { MediaItem } from "@/types/media";
import { mediaSrc } from "@/hooks/useMedia";

interface MediaRendererProps {
  item: MediaItem | null;
  onNext: () => void;
  className?: string;
  imgClassName?: string;
  videoClassName?: string;
  quoteClassName?: string;
  emptyClassName?: string;
  emptyText?: string;
}

export function MediaRenderer({
  item,
  onNext,
  className = "",
  imgClassName = "max-h-full max-w-full object-contain",
  videoClassName = "max-h-full max-w-full object-contain",
  quoteClassName = "",
  emptyClassName = "",
  emptyText = "No media",
}: MediaRendererProps) {
  if (!item) {
    return (
      <div className={`flex items-center justify-center ${emptyClassName}`}>
        <p>{emptyText}</p>
      </div>
    );
  }

  if (item.type === "quote") {
    return (
      <div className={`flex flex-col items-center justify-center px-8 text-center ${quoteClassName}`}>
        <blockquote className="text-xl italic">
          {(item.title ?? item.uri) || "—"}
        </blockquote>
        {(item.attribution ?? item.uri) && (
          <cite className="mt-4 text-sm opacity-60">{item.attribution ?? item.uri}</cite>
        )}
      </div>
    );
  }

  if (item.type === "video") {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <video
          key={item.id}
          className={videoClassName}
          src={mediaSrc(item)}
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
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <img
          key={item.id}
          className={imgClassName}
          src={mediaSrc(item)}
          alt={item.title ?? ""}
        />
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-center ${emptyClassName}`}>
      <p>Unknown type: {item.type}</p>
    </div>
  );
}
