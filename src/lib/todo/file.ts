/**
 * Read/write helpers for TODO file (used by API routes).
 * Writes are atomic per spec §9.2 (temp file + rename when supported).
 */
import { readFile, rename, stat, unlink, writeFile } from "node:fs/promises";

export async function readTodoFile(
  filePath: string
): Promise<{ content: string | null; lastModified?: string }> {
  try {
    const statResult = await stat(filePath);
    const content = await readFile(filePath, "utf-8");
    return {
      content,
      lastModified: statResult.mtime.toISOString(),
    };
  } catch (err) {
    const code =
      err && typeof err === "object" && "code" in err
        ? (err as NodeJS.ErrnoException).code
        : undefined;
    if (code === "ENOENT") {
      return { content: null, lastModified: undefined };
    }
    throw err;
  }
}

/**
 * Writes content atomically: write to temp file then rename to target.
 * On cross-filesystem rename failure, falls back to direct write and removes temp.
 */
export async function writeTodoFile(
  filePath: string,
  content: string
): Promise<void> {
  const tempPath = `${filePath}.tmp.${Date.now()}`;
  await writeFile(tempPath, content, "utf-8");
  try {
    await rename(tempPath, filePath);
  } catch {
    await writeFile(filePath, content, "utf-8");
    await unlink(tempPath).catch(() => {});
  }
}
