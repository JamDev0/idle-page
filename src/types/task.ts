/**
 * Task model (spec §7.1).
 * Checklist item with stable hidden ID for safe patching and reorder.
 */
export interface Task {
  /** Stable hidden ID (inline metadata reference). */
  id: string;
  /** Checklist text. */
  text: string;
  /** Completed state. */
  checked: boolean;
  /** Current structural reference for safe patching (e.g. line index). */
  lineRef: number;
  /** Original source line for diff-safe writes. */
  rawLine: string;
}
