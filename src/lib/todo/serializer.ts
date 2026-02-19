/**
 * Safe TODO writeback (spec §6.2, §9.2).
 * Patches only recognized checklist lines; preserves all other content.
 */
import type { Task } from "@/types/task";
import { IDLE_ID_PREFIX } from "@/lib/fs/hostPath";

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
