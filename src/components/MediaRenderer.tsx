"use client";

import type { MediaItem } from "@/types/media";
import { mediaSrc } from "@/hooks/useMedia";

interface MediaRendererProps {
  item: MediaItem | null;
  overlayQuote?: MediaItem | null;
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
  overlayQuote = null,
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
      <div className={`relative flex items-center justify-center ${className}`}>
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
        {overlayQuote && (
          <div className="pointer-events-none absolute bottom-6 left-1/2 w-[min(72vw,760px)] -translate-x-1/2 rounded border border-red-900/30 bg-[#241414]/60 px-5 py-3 text-center backdrop-blur-sm shadow-[0_10px_32px_rgba(9,4,4,0.45)]">
            <blockquote className="text-base italic text-red-200/80 md:text-lg">
              {(overlayQuote.title ?? overlayQuote.uri) || "—"}
            </blockquote>
            {(overlayQuote.attribution ?? overlayQuote.uri) && (
              <cite className="mt-2 block text-xs text-red-400/70 md:text-sm">
                {(overlayQuote.attribution ?? overlayQuote.uri) || ""}
              </cite>
            )}
          </div>
        )}
      </div>
    );
  }

  if (item.type === "image" || item.type === "gif") {
    return (
      <div className={`relative flex items-center justify-center ${className}`}>
        <img
          key={item.id}
          className={imgClassName}
          src={mediaSrc(item)}
          alt={item.title ?? ""}
        />
        {overlayQuote && (
          <div className="pointer-events-none absolute bottom-6 left-1/2 w-[min(72vw,760px)] -translate-x-1/2 rounded border border-red-900/30 bg-[#241414]/60 px-5 py-3 text-center backdrop-blur-sm shadow-[0_10px_32px_rgba(9,4,4,0.45)]">
            <blockquote className="text-base italic text-red-200/80 md:text-lg">
              {(overlayQuote.title ?? overlayQuote.uri) || "—"}
            </blockquote>
            {(overlayQuote.attribution ?? overlayQuote.uri) && (
              <cite className="mt-2 block text-xs text-red-400/70 md:text-sm">
                {(overlayQuote.attribution ?? overlayQuote.uri) || ""}
              </cite>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-center ${emptyClassName}`}>
      <p>Unknown type: {item.type}</p>
    </div>
  );
}
