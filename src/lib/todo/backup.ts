/**
 * Rolling backups for TODO file (spec §9.4).
 * Naming: {basename}.bak.YYYYMMDD-HHMMSS in same directory.
 */
import { readdir, writeFile } from "node:fs/promises";
import path from "node:path";

const BACKUP_PREFIX = ".bak.";

function formatTimestamp(): string {
  const now = new Date();
  const y = now.getFullYear();
  const M = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const H = String(now.getHours()).padStart(2, "0");
  const m = String(now.getMinutes()).padStart(2, "0");
  const s = String(now.getSeconds()).padStart(2, "0");
  return `${y}${M}${d}-${H}${m}${s}`;
}

/**
 * Writes a backup of the given content next to filePath.
 * Backup name: {filePath}.bak.YYYYMMDD-HHMMSS (e.g. TO-DO.md.bak.20260219-143022).
 */
export async function createBackup(
  filePath: string,
  content: string
): Promise<string> {
  const dir = path.dirname(filePath);
  const base = path.basename(filePath);
  const backupName = `${base}${BACKUP_PREFIX}${formatTimestamp()}`;
  const backupPath = path.join(dir, backupName);
  await writeFile(backupPath, content, "utf-8");
  return backupPath;
}

/**
 * Removes oldest backups for the same basename in the same directory,
 * keeping at most keepCount backups.
 */
export async function pruneBackups(
  filePath: string,
  keepCount: number
): Promise<string[]> {
  const dir = path.dirname(filePath);
  const base = path.basename(filePath);
  const prefix = `${base}${BACKUP_PREFIX}`;

  let entries: string[];
  try {
    entries = await readdir(dir);
  } catch {
    return [];
  }

  const backups = entries
    .filter((e) => e.startsWith(prefix))
    .map((name) => path.join(dir, name))
    .sort();

  if (backups.length <= keepCount) return [];

  const toRemove = backups.slice(0, backups.length - keepCount);
  const { unlink } = await import("node:fs/promises");
  const removed: string[] = [];
  for (const p of toRemove) {
    try {
      await unlink(p);
      removed.push(p);
    } catch {
      // ignore per-file errors
    }
  }
  return removed;
}
