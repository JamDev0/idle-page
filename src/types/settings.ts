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
}

export const DEFAULT_SETTINGS: Settings = {
  todoFilePath: "",
  rotationMode: "random",
  showCompleted: true,
  prefetchConcurrency: 2,
  remoteCacheLimitMb: 2048,
  designVariant: "void-minimal",
};
