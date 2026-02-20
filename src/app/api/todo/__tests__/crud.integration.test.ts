/**
 * Integration tests for TODO API CRUD lifecycle (spec §15.2).
 * Runs GET/POST/PATCH/reorder/DELETE against a temporary markdown file.
 * @jest-environment node
 */
import { mkdtemp, readFile, unlink, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { NextRequest } from "next/server";
import * as TodoRoute from "../route";
import * as TodoIdRoute from "../[id]/route";
import * as ReorderRoute from "../reorder/route";

const originalEnv = process.env;

function requestWithPath(filePath: string, pathname: string): NextRequest {
  const url = `http://localhost${pathname}?filePath=${encodeURIComponent(filePath)}`;
  return new NextRequest(url);
}

function requestWithBody(
  filePath: string,
  pathname: string,
  method: string,
  body: object
): NextRequest {
  const url = `http://localhost${pathname}?filePath=${encodeURIComponent(filePath)}`;
  return new NextRequest(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("TODO API CRUD integration", () => {
  let tmpDir: string;
  let filePath: string;

  beforeAll(async () => {
    tmpDir = await mkdtemp(path.join(os.tmpdir(), "idle-todo-crud-"));
    process.env.TODO_BASE_PATH = tmpDir;
    filePath = path.join(tmpDir, "TO-DO.md");
    await writeFile(
      filePath,
      "- [ ] first\n- [ ] second\n- [ ] third\n",
      "utf-8"
    );
  });

  afterAll(async () => {
    process.env = { ...originalEnv };
    try {
      await unlink(filePath);
    } catch {
      // ignore
    }
  });

  it("GET returns parsed tasks", async () => {
    const req = requestWithPath(filePath, "/api/todo");
    const res = await TodoRoute.GET(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.tasks).toHaveLength(3);
    expect(data.fileHealth).toBe("ok");
    expect(data.tasks.map((t: { text: string }) => t.text)).toEqual([
      "first",
      "second",
      "third",
    ]);
  });

  it("POST creates a task", async () => {
    const req = requestWithBody(filePath, "/api/todo", "POST", {
      text: "new task",
    });
    const res = await TodoRoute.POST(req);
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.task).toBeDefined();
    expect(data.task.text).toBe("new task");
    expect(data.task.checked).toBe(false);
    const createdId = data.task.id;

    const getReq = requestWithPath(filePath, "/api/todo");
    const getRes = await TodoRoute.GET(getReq);
    const getData = await getRes.json();
    expect(getData.tasks).toHaveLength(4);
    const newTask =
      getData.tasks.find((t: { id: string }) => t.id === createdId) ??
      getData.tasks.find((t: { text: string }) => t.text === "new task");
    expect(newTask).toBeDefined();
    expect(newTask?.text).toBe("new task");
  });

  it("PATCH updates task text and checked", async () => {
    const getReq = requestWithPath(filePath, "/api/todo");
    const getRes = await TodoRoute.GET(getReq);
    const getData = await getRes.json();
    const task = getData.tasks.find((t: { text: string }) => t.text === "first");
    expect(task).toBeDefined();

    const patchReq = requestWithBody(filePath, `/api/todo/${task.id}`, "PATCH", {
      text: "first updated",
      checked: true,
    });
    const patchRes = await TodoIdRoute.PATCH(patchReq, {
      params: Promise.resolve({ id: task.id }),
    });
    expect(patchRes.status).toBe(200);
    const patchData = await patchRes.json();
    expect(patchData.task.text).toBe("first updated");
    expect(patchData.task.checked).toBe(true);

    const getReq2 = requestWithPath(filePath, "/api/todo");
    const getRes2 = await TodoRoute.GET(getReq2);
    const getData2 = await getRes2.json();
    const updated = getData2.tasks.find((t: { id: string }) => t.id === task.id);
    expect(updated?.text).toBe("first updated");
    expect(updated?.checked).toBe(true);
  });

  it("PATCH with empty text returns 400 and does not write (spec §5.2 malformed writes)", async () => {
    const getReq = requestWithPath(filePath, "/api/todo");
    const getRes = await TodoRoute.GET(getReq);
    const getData = await getRes.json();
    const task = getData.tasks.find((t: { text: string }) => t.text === "third");
    expect(task).toBeDefined();
    const contentBefore = await readFile(filePath, "utf-8");

    const patchReq = requestWithBody(filePath, `/api/todo/${task.id}`, "PATCH", {
      text: "   ",
    });
    const patchRes = await TodoIdRoute.PATCH(patchReq, {
      params: Promise.resolve({ id: task.id }),
    });
    expect(patchRes.status).toBe(400);
    const patchData = await patchRes.json();
    expect(patchData.error).toContain("empty");

    const contentAfter = await readFile(filePath, "utf-8");
    expect(contentAfter).toBe(contentBefore);
  });

  it("POST reorder reorders tasks", async () => {
    const getReq = requestWithPath(filePath, "/api/todo");
    const getRes = await TodoRoute.GET(getReq);
    const getData = await getRes.json();
    const tasks = getData.tasks as Array<{ id: string; text: string }>;
    expect(tasks.length).toBeGreaterThanOrEqual(3);
    const orderedIds = [
      tasks[1].id,
      tasks[0].id,
      tasks[2].id,
      ...tasks.slice(3).map((t) => t.id),
    ];
    const expectedTextOrder = [
      tasks[1].text,
      tasks[0].text,
      tasks[2].text,
      ...tasks.slice(3).map((t) => t.text),
    ];

    const reorderReq = requestWithBody(filePath, "/api/todo/reorder", "POST", {
      orderedTaskIds: orderedIds,
    });
    const reorderRes = await ReorderRoute.POST(reorderReq);
    expect(reorderRes.status).toBe(200);
    const reorderData = await reorderRes.json();
    expect(reorderData.tasks).toHaveLength(orderedIds.length);
    expect(reorderData.tasks.map((t: { text: string }) => t.text)).toEqual(
      expectedTextOrder
    );

    const content = await readFile(filePath, "utf-8");
    const lines = content.split(/\r?\n/).filter(Boolean);
    expect(lines.length).toBeGreaterThanOrEqual(3);
  });

  it("DELETE removes a task", async () => {
    const getReq = requestWithPath(filePath, "/api/todo");
    const getRes = await TodoRoute.GET(getReq);
    const getData = await getRes.json();
    const toDelete = getData.tasks.find((t: { text: string }) => t.text === "second");
    expect(toDelete).toBeDefined();

    const deleteReq = new NextRequest(
      `http://localhost/api/todo/${toDelete.id}?filePath=${encodeURIComponent(filePath)}`,
      { method: "DELETE" }
    );
    const deleteRes = await TodoIdRoute.DELETE(deleteReq, {
      params: Promise.resolve({ id: toDelete.id }),
    });
    expect(deleteRes.status).toBe(200);
    const deleteData = await deleteRes.json();
    expect(deleteData.deleted).toBe(toDelete.id);

    const getReq2 = requestWithPath(filePath, "/api/todo");
    const getRes2 = await TodoRoute.GET(getReq2);
    const getData2 = await getRes2.json();
    expect(getData2.tasks.some((t: { id: string }) => t.id === toDelete.id)).toBe(false);
  });

  it("GET with missing filePath returns 400", async () => {
    const req = new NextRequest("http://localhost/api/todo");
    const res = await TodoRoute.GET(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain("filePath");
  });

  it("POST reorder with unsafe window returns 400", async () => {
    await writeFile(filePath, "- [ ] a\n\n- [ ] b\n", "utf-8");
    const getReq = requestWithPath(filePath, "/api/todo");
    const getRes = await TodoRoute.GET(getReq);
    const getData = await getRes.json();
    const ids = getData.tasks.map((t: { id: string }) => t.id);

    const reorderReq = requestWithBody(filePath, "/api/todo/reorder", "POST", {
      orderedTaskIds: [ids[1], ids[0]],
    });
    const reorderRes = await ReorderRoute.POST(reorderReq);
    expect(reorderRes.status).toBe(400);
    const reorderData = await reorderRes.json();
    expect(reorderData.error).toContain("Reorder not allowed");
    expect(reorderData.reason).toBeDefined();
  });
});
