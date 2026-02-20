/**
 * Unit tests for POST /api/media/upload (spec §11.1).
 * @jest-environment node
 */
import { mkdtemp, readdir, readFile, rm } from "node:fs/promises";
import path from "node:path";
import { tmpdir } from "node:os";
import { NextRequest } from "next/server";
import * as UploadRoute from "../upload/route";

const originalEnv = process.env;
let tempDir: string;

beforeAll(async () => {
  tempDir = await mkdtemp(path.join(tmpdir(), "idle-upload-"));
  process.env.MEDIA_BASE_PATH = tempDir;
});

afterAll(async () => {
  process.env = { ...originalEnv };
  await rm(tempDir, { recursive: true, force: true });
});

describe("POST /api/media/upload", () => {
  it("returns 400 when no files in form", async () => {
    const formData = new FormData();
    const req = new NextRequest("http://localhost/api/media/upload", {
      method: "POST",
      body: formData,
    });
    const res = await UploadRoute.POST(req);
    expect(res.status).toBe(400);
    const data = (await res.json()) as { error?: string };
    expect(data.error).toContain("No files");
  });

  it("rejects disallowed file type and returns 400 when no valid files", async () => {
    const formData = new FormData();
    const blob = new Blob(["x"], { type: "application/octet-stream" });
    const file = new File([blob], "bad.txt", { type: "text/plain" });
    formData.append("files", file);
    const req = new NextRequest("http://localhost/api/media/upload", {
      method: "POST",
      body: formData,
    });
    const res = await UploadRoute.POST(req);
    expect(res.status).toBe(400);
    const data = (await res.json()) as { error?: string; rejected?: { name: string; reason: string }[] };
    expect(data.error).toContain("No valid files");
    expect(Array.isArray(data.rejected)).toBe(true);
    expect(data.rejected?.some((r) => r.name === "bad.txt")).toBe(true);
  });

  it("accepts valid image file, writes to MEDIA_BASE_PATH, and registers", async () => {
    const formData = new FormData();
    const blob = new Blob(["fake png content"], { type: "image/png" });
    const file = new File([blob], "photo.png", { type: "image/png" });
    formData.append("files", file);
    const req = new NextRequest("http://localhost/api/media/upload", {
      method: "POST",
      body: formData,
    });
    const res = await UploadRoute.POST(req);
    expect(res.status).toBe(201);
    const data = (await res.json()) as { items?: { id: string; uri: string; source: string }[] };
    expect(Array.isArray(data.items)).toBe(true);
    expect(data.items).toHaveLength(1);
    expect(data.items?.[0].source).toBe("local");
    expect(data.items?.[0].uri).toContain(tempDir);
    const dirEntries = await readdir(tempDir);
    const mediaFiles = dirEntries.filter((e) => e.endsWith(".png"));
    expect(mediaFiles.length).toBeGreaterThanOrEqual(1);
    const registryPath = path.join(tempDir, "media-registry.json");
    const registryRaw = await readFile(registryPath, "utf-8");
    const registry = JSON.parse(registryRaw) as { items: { id: string; uri: string }[] };
    expect(registry.items.length).toBeGreaterThanOrEqual(1);
    expect(registry.items.some((i) => i.uri.includes(mediaFiles[0] ?? ""))).toBe(true);
  });
});
