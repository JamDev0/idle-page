/**
 * Settings model (localStorage) (spec §7.3).
 */
export type RotationMode = "random" | "playlist";

/** Design variant (spec §13.2 finalists). */
export type DesignVariant = "void-minimal" | "glass-ambient";

export interface Settings {
  todoFilePath: string;
  rotationMode: RotationMode;
  showCompleted: boolean;
  prefetchConcurrency: number;
  remoteCacheLimitMb: number;
  designVariant: DesignVariant;
  /** When true, after each TODO write a debounced git checkpoint is requested (optional follow-up per spec). */
  autoCheckpoint: boolean;
  /** Debounce delay in seconds before triggering checkpoint (used when autoCheckpoint is true). */
  checkpointDebounceSec: number;
}

export const DEFAULT_SETTINGS: Settings = {
  todoFilePath: "",
  rotationMode: "random",
  showCompleted: true,
  prefetchConcurrency: 2,
  remoteCacheLimitMb: 2048,
  designVariant: "void-minimal",
  autoCheckpoint: false,
  checkpointDebounceSec: 10,
};
