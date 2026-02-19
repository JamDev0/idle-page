/**
 * GET /api/todo — parsed checklist, warnings, file health, last modified.
 * POST /api/todo — create task (body: { text, afterTaskId? }).
 */
import { NextRequest } from "next/server";
import { mkdir } from "node:fs/promises";
import { dirname } from "node:path";
import { normalizeTodoFilePath } from "@/lib/fs/hostPath";
import { createBackup, pruneBackups } from "@/lib/todo/backup";
import { readTodoFile, writeTodoFile } from "@/lib/todo/file";
import { parseTodoFile, parseTodoMarkdown } from "@/lib/todo/parser";
import {
  buildChecklistLine,
  insertLineAfter,
  linesToContent,
} from "@/lib/todo/serializer";
import type { TodoParseResult } from "@/types/task";

const FILE_PATH_PARAM = "filePath";

function getFilePath(request: NextRequest): string | null {
  const filePath = request.nextUrl.searchParams.get(FILE_PATH_PARAM);
  return filePath ? normalizeTodoFilePath(filePath) : null;
}

export async function GET(request: NextRequest) {
  const filePath = getFilePath(request);
  if (!filePath) {
    return Response.json(
      { error: "Missing or invalid filePath" },
      { status: 400 }
    );
  }

  let content: string | null = null;
  let lastModified: string | undefined;
  try {
    const read = await readTodoFile(filePath);
    content = read.content;
    lastModified = read.lastModified;
  } catch {
    return Response.json(
      {
        tasks: [],
        parseWarnings: ["File could not be read."],
        fileHealth: "unreadable" as const,
        lastModified: undefined,
      } satisfies TodoParseResult,
      { status: 200 }
    );
  }

  if (content === null) {
    return Response.json(
      {
        tasks: [],
        parseWarnings: ["File not found."],
        fileHealth: "missing" as const,
        lastModified: undefined,
      } satisfies TodoParseResult,
      { status: 200 }
    );
  }

  const result = parseTodoFile(filePath, content, lastModified);
  return Response.json(result, { status: 200 });
}

interface PostBody {
  text?: string;
  afterTaskId?: string;
}

export async function POST(
  request: NextRequest
) {
  const filePath = getFilePath(request);
  if (!filePath) {
    return Response.json(
      { error: "Missing or invalid filePath" },
      { status: 400 }
    );
  }

  let body: PostBody = {};
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const text = typeof body.text === "string" ? body.text.trim() : "";
  if (!text) {
    return Response.json(
      { error: "Body must include non-empty text" },
      { status: 400 }
    );
  }

  let content: string;
  let lastModified: string | undefined;
  try {
    const read = await readTodoFile(filePath);
    content = read.content ?? "";
    lastModified = read.lastModified;
  } catch {
    return Response.json(
      { error: "File could not be read" },
      { status: 500 }
    );
  }

  const parsed = parseTodoMarkdown(content);
  const tasks = parsed.tasks;
  const afterTaskId = body.afterTaskId;
  let insertAfterLineRef: number;
  if (afterTaskId) {
    const after = tasks.find((t) => t.id === afterTaskId);
    insertAfterLineRef = after ? after.lineRef : tasks.length > 0 ? tasks[tasks.length - 1].lineRef : -1;
  } else {
    insertAfterLineRef = tasks.length > 0 ? tasks[tasks.length - 1].lineRef : -1;
  }

  const newId = `new-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  const newTask = {
    id: newId,
    text,
    checked: false,
  };
  const newLine = buildChecklistLine(newTask);
  const lines = content.split(/\r?\n/);
  const updatedLines = insertLineAfter(lines, insertAfterLineRef, newLine);
  const newContent = linesToContent(updatedLines, content);

  try {
    await mkdir(dirname(filePath), { recursive: true });
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

  const created = {
    id: newId,
    text: newTask.text,
    checked: newTask.checked,
    lineRef: insertAfterLineRef + 1,
    rawLine: newLine,
  };
  return Response.json({ task: created, lastModified }, { status: 201 });
}
