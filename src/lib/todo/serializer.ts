/**
 * Safe TODO writeback (spec §6.2, §9.2).
 * Patches only recognized checklist lines; preserves all other content.
 * Reorder: allowed only in contiguous checklist blocks (spec §9.3).
 */
import type { Task } from "@/types/task";
import { IDLE_ID_PREFIX } from "@/lib/fs/hostPath";

export type ReorderValidation =
  | { ok: true; minLineRef: number; maxLineRef: number }
  | { ok: false; reason: string };

/**
 * Validates that orderedTaskIds form a contiguous checklist block (no non-checklist lines in range).
 * Returns the line range when safe, or a precise reason when unsafe.
 */
export function validateReorderWindow(
  tasks: Task[],
  orderedTaskIds: string[]
): ReorderValidation {
  if (!Array.isArray(orderedTaskIds) || orderedTaskIds.length === 0) {
    return { ok: false, reason: "orderedTaskIds must be a non-empty array" };
  }
  const idSet = new Set(tasks.map((t) => t.id));
  const missing = orderedTaskIds.filter((id) => !idSet.has(id));
  if (missing.length > 0) {
    return { ok: false, reason: `Unknown task id(s): ${missing.join(", ")}` };
  }
  const taskById = new Map(tasks.map((t) => [t.id, t]));
  const reorderTasks = orderedTaskIds
    .map((id) => taskById.get(id))
    .filter((t): t is Task => t !== undefined);
  const lineRefs = reorderTasks.map((t) => t.lineRef).sort((a, b) => a - b);
  const minLineRef = lineRefs[0] ?? 0;
  const maxLineRef = lineRefs[lineRefs.length - 1] ?? 0;
  const expectedSpan = maxLineRef - minLineRef + 1;
  if (reorderTasks.length !== expectedSpan) {
    return {
      ok: false,
      reason:
        "Reorder only allowed in a contiguous checklist block; mixed or non-checklist content in range",
    };
  }
  const contiguous =
    lineRefs.every((ref, i) => ref === minLineRef + i);
  if (!contiguous) {
    return {
      ok: false,
      reason:
        "Reorder only allowed in a contiguous checklist block; non-checklist lines in range",
    };
  }
  return { ok: true, minLineRef, maxLineRef };
}

/**
 * Replaces the contiguous block [minLineRef, maxLineRef] with checklist lines in orderedTaskIds order.
 * Caller must have validated with validateReorderWindow first.
 */
export function applyReorder(
  lines: string[],
  tasks: Task[],
  orderedTaskIds: string[],
  minLineRef: number,
  maxLineRef: number
): string[] {
  const taskById = new Map(tasks.map((t) => [t.id, t]));
  const orderedRawLines = orderedTaskIds
    .map((id) => taskById.get(id)?.rawLine)
    .filter((line): line is string => line !== undefined);
  if (orderedRawLines.length !== orderedTaskIds.length) return lines;
  const before = lines.slice(0, minLineRef);
  const after = lines.slice(maxLineRef + 1);
  return [...before, ...orderedRawLines, ...after];
}

/** Builds a single checklist line with optional idle-id comment. */
export function buildChecklistLine(task: {
  text: string;
  checked: boolean;
  id: string;
}): string {
  const box = task.checked ? "[x]" : "[ ]";
  const trim = task.text.trim();
  return `- ${box} ${trim} <!-- ${IDLE_ID_PREFIX}${task.id} -->`;
}

/**
 * Replaces the line at lineRef with a new checklist line.
 * Preserves all other lines and order.
 */
export function patchLine(
  lines: string[],
  lineRef: number,
  newRawLine: string
): string[] {
  if (lineRef < 0 || lineRef >= lines.length) return lines;
  const out = [...lines];
  out[lineRef] = newRawLine;
  return out;
}

/**
 * Inserts a new line after the given index.
 * If afterIndex is -1, inserts at start.
 */
export function insertLineAfter(
  lines: string[],
  afterIndex: number,
  newRawLine: string
): string[] {
  const idx = afterIndex < 0 ? 0 : afterIndex + 1;
  return [...lines.slice(0, idx), newRawLine, ...lines.slice(idx)];
}

/** Removes the line at lineRef. */
export function removeLine(lines: string[], lineRef: number): string[] {
  if (lineRef < 0 || lineRef >= lines.length) return lines;
  return [...lines.slice(0, lineRef), ...lines.slice(lineRef + 1)];
}

/**
 * Serializes updated lines back to file content.
 * Uses newline from original content if detectable, else \n.
 */
export function linesToContent(lines: string[], originalContent: string): string {
  const hasCRLF = /\r\n/.test(originalContent);
  return lines.join(hasCRLF ? "\r\n" : "\n");
}
