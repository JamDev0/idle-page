/**
 * Media model (spec §7.2).
 */
export type MediaType = "image" | "gif" | "video" | "quote";
export type MediaSource = "local" | "remote" | "inline";
export type MediaStatus = "ready" | "loading" | "failed";

export interface MediaItem {
  /** Stable media ID. */
  id: string;
  type: MediaType;
  source: MediaSource;
  /** Absolute local path or URL. */
  uri: string;
  title?: string;
  durationHintMs?: number;
  status: MediaStatus;
}
