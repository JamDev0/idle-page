/**
 * POST /api/todo/reorder — reorder tasks by ID list (spec §8.1).
 * Validates safe reorder window (contiguous checklist block) before applying.
 */
import { NextRequest } from "next/server";
import { normalizeTodoFilePath } from "@/lib/fs/hostPath";
import { createBackup, pruneBackups } from "@/lib/todo/backup";
import { readTodoFile, writeTodoFile } from "@/lib/todo/file";
import { parseTodoMarkdown } from "@/lib/todo/parser";
import {
  applyReorder,
  linesToContent,
  validateReorderWindow,
} from "@/lib/todo/serializer";
import type { TodoParseResult } from "@/types/task";

const FILE_PATH_PARAM = "filePath";

function getFilePath(request: NextRequest): string | null {
  const filePath = request.nextUrl.searchParams.get(FILE_PATH_PARAM);
  return filePath ? normalizeTodoFilePath(filePath) : null;
}

interface ReorderBody {
  orderedTaskIds?: string[];
}

export async function POST(request: NextRequest) {
  const filePath = getFilePath(request);
  if (!filePath) {
    return Response.json(
      { error: "Missing or invalid filePath" },
      { status: 400 }
    );
  }

  let body: ReorderBody = {};
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const orderedTaskIds = body.orderedTaskIds;
  if (!Array.isArray(orderedTaskIds)) {
    return Response.json(
      { error: "Body must include orderedTaskIds (array of task IDs)" },
      { status: 400 }
    );
  }

  let content: string;
  try {
    const read = await readTodoFile(filePath);
    content = read.content ?? "";
  } catch {
    return Response.json(
      { error: "File could not be read" },
      { status: 500 }
    );
  }

  const parsed = parseTodoMarkdown(content);
  const validation = validateReorderWindow(parsed.tasks, orderedTaskIds);

  if (!validation.ok) {
    return Response.json(
      { error: "Reorder not allowed", reason: validation.reason },
      { status: 400 }
    );
  }

  const lines = content.split(/\r?\n/);
  const updatedLines = applyReorder(
    lines,
    parsed.tasks,
    orderedTaskIds,
    validation.minLineRef,
    validation.maxLineRef
  );
  const newContent = linesToContent(updatedLines, content);

  try {
    await writeTodoFile(filePath, newContent);
    try {
      await createBackup(filePath, newContent);
      await pruneBackups(filePath, 5);
    } catch {
      // backup is best-effort; do not fail the request
    }
  } catch {
    return Response.json(
      { error: "File could not be written" },
      { status: 500 }
    );
  }

  const reparse = parseTodoMarkdown(newContent);
  const result: TodoParseResult = {
    tasks: reparse.tasks,
    parseWarnings: reparse.parseWarnings,
    fileHealth: reparse.fileHealth,
  };
  return Response.json(result, { status: 200 });
}
