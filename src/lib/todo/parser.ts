/**
 * TODO checklist parser (spec §6.2, §9.1).
 * Reads only checklist lines (- [ ] / - [x]); preserves and ignores non-checklist content.
 */
import { createHash } from "node:crypto";
import type { Task } from "@/types/task";
import type { TodoFileHealth, TodoParseResult } from "@/types/task";
import { IDLE_ID_PREFIX } from "@/lib/fs/hostPath";

/** Matches checklist line: optional whitespace, "-", "[ ]" or "[x]", rest is text; optional trailing idle-id comment. */
const CHECKLIST_RE =
  /^\s*-\s+\[([ xX])\]\s*(.*?)(?:\s*<!--\s*idle-id:([a-f0-9]+)\s*-->)?\s*$/;

function deterministicId(lineRef: number, rawLine: string): string {
  const payload = `${lineRef}:${rawLine}`;
  return createHash("sha256").update(payload, "utf8").digest("hex").slice(0, 12);
}

/**
 * Parses markdown text into checklist tasks only.
 * Injects deterministic IDs for lines that lack them (spec §7.1).
 */
export function parseTodoMarkdown(content: string): TodoParseResult {
  const parseWarnings: string[] = [];
  const tasks: Task[] = [];
  const lines = content.split(/\r?\n/);

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const match = rawLine.match(CHECKLIST_RE);
    if (!match) continue;

    const [, checkChar, text, existingId] = match;
    const checked = checkChar.toLowerCase() === "x";
    const textTrimmed = (text ?? "").trim();
    const id = existingId ?? deterministicId(i, rawLine);

    tasks.push({
      id,
      text: textTrimmed,
      checked,
      lineRef: i,
      rawLine,
    });
  }

  return {
    tasks,
    parseWarnings,
    fileHealth: "ok",
  };
}

/**
 * Reads and parses a TODO file from disk.
 * Returns fileHealth "missing" | "unreadable" | "parse_error" when appropriate.
 */
export function parseTodoFile(
  filePath: string,
  content: string | null,
  lastModified?: string
): TodoParseResult {
  if (content === null) {
    return {
      tasks: [],
      parseWarnings: ["File not found or not readable."],
      fileHealth: "unreadable",
      lastModified,
    };
  }

  try {
    const result = parseTodoMarkdown(content);
    result.lastModified = lastModified;
    return result;
  } catch (err) {
    return {
      tasks: [],
      parseWarnings: [err instanceof Error ? err.message : "Parse failed."],
      fileHealth: "parse_error",
      lastModified,
    };
  }
}
