/**
 * Optional git checkpoint (spec §6.2, §8.3, M7).
 * Attempts git add + commit for the TODO file; returns graceful fallback if unavailable.
 */
import { execSync } from "node:child_process";
import path from "node:path";

export type CheckpointResult =
  | { ok: true; message?: string }
  | { ok: false; reason: string };

/**
 * Attempts to commit the file at filePath to git (add + commit).
 * Returns { ok: true } on success, or { ok: false, reason } when git is unavailable,
 * path is not in a repo, or commit fails.
 */
export function attemptCheckpoint(
  filePath: string,
  commitMessage?: string
): CheckpointResult {
  const dir = path.dirname(filePath);
  const base = path.basename(filePath);

  try {
    execSync("git rev-parse --show-toplevel", {
      cwd: dir,
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "pipe"],
    });
  } catch {
    return { ok: false, reason: "Not a git repository (or git not available)" };
  }

  const message =
    commitMessage ??
    `idle-page checkpoint: ${new Date().toISOString().replace("T", " ").slice(0, 19)}`;

  try {
    execSync(`git add -- "${base}"`, {
      cwd: dir,
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "pipe"],
    });
  } catch (err) {
    const msg = err && typeof err === "object" && "message" in err ? String((err as { message: string }).message) : "git add failed";
    return { ok: false, reason: msg };
  }

  try {
    execSync(`git commit -m ${JSON.stringify(message)}`, {
      cwd: dir,
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "pipe"],
    });
  } catch (err) {
    const msg = err && typeof err === "object" && "message" in err ? String((err as { message: string }).message) : "git commit failed";
    if (/nothing to commit|no changes/.test(msg)) {
      return { ok: true, message: "No changes to commit" };
    }
    return { ok: false, reason: msg };
  }

  return { ok: true };
}
