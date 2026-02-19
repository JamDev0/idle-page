/**
 * PATCH /api/todo/:id — update text and/or checked.
 * DELETE /api/todo/:id — delete task by ID.
 */
import { NextRequest } from "next/server";
import { normalizeTodoFilePath } from "@/lib/fs/hostPath";
import { createBackup, pruneBackups } from "@/lib/todo/backup";
import { readTodoFile, writeTodoFile } from "@/lib/todo/file";
import { parseTodoMarkdown } from "@/lib/todo/parser";
import {
  buildChecklistLine,
  linesToContent,
  patchLine,
  removeLine,
} from "@/lib/todo/serializer";
import type { Task } from "@/types/task";

const FILE_PATH_PARAM = "filePath";

function getFilePath(request: NextRequest): string | null {
  const filePath = request.nextUrl.searchParams.get(FILE_PATH_PARAM);
  return filePath ? normalizeTodoFilePath(filePath) : null;
}

interface PatchBody {
  text?: string;
  checked?: boolean;
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const filePath = getFilePath(request);
  if (!filePath) {
    return Response.json(
      { error: "Missing or invalid filePath" },
      { status: 400 }
    );
  }

  const { id } = await context.params;
  if (!id) {
    return Response.json({ error: "Missing task id" }, { status: 400 });
  }

  let body: PatchBody = {};
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const hasText = typeof body.text === "string";
  const hasChecked = typeof body.checked === "boolean";
  if (!hasText && !hasChecked) {
    return Response.json(
      { error: "Body must include text and/or checked" },
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
  const task = parsed.tasks.find((t) => t.id === id);
  if (!task) {
    return Response.json({ error: "Task not found" }, { status: 404 });
  }

  const updated: Task = {
    ...task,
    text: hasText ? (body.text as string).trim() : task.text,
    checked: hasChecked ? (body.checked as boolean) : task.checked,
  };
  const newLine = buildChecklistLine(updated);
  const lines = content.split(/\r?\n/);
  const updatedLines = patchLine(lines, task.lineRef, newLine);
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

  const result: Task = { ...updated, rawLine: newLine };
  return Response.json({ task: result }, { status: 200 });
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const filePath = getFilePath(request);
  if (!filePath) {
    return Response.json(
      { error: "Missing or invalid filePath" },
      { status: 400 }
    );
  }

  const { id } = await context.params;
  if (!id) {
    return Response.json({ error: "Missing task id" }, { status: 400 });
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
  const task = parsed.tasks.find((t) => t.id === id);
  if (!task) {
    return Response.json({ error: "Task not found" }, { status: 404 });
  }

  const lines = content.split(/\r?\n/);
  const updatedLines = removeLine(lines, task.lineRef);
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

  return Response.json({ deleted: id }, { status: 200 });
}
