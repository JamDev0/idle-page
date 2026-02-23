/**
 * Settings model (localStorage) (spec §7.3).
 */
export type RotationMode = "random" | "playlist";

export interface Settings {
  todoFilePath: string;
  rotationMode: RotationMode;
  showCompleted: boolean;
  prefetchConcurrency: number;
  remoteCacheLimitMb: number;
  autoCheckpoint: boolean;
  checkpointDebounceSec: number;
}

export const DEFAULT_SETTINGS: Settings = {
  todoFilePath: "",
  rotationMode: "random",
  showCompleted: true,
  prefetchConcurrency: 2,
  remoteCacheLimitMb: 2048,
  autoCheckpoint: false,
  checkpointDebounceSec: 10,
};
