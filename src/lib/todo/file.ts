/**
 * Read/write helpers for TODO file (used by API routes).
 */
import { readFile, stat, writeFile } from "node:fs/promises";

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

export async function writeTodoFile(
  filePath: string,
  content: string
): Promise<void> {
  await writeFile(filePath, content, "utf-8");
}
