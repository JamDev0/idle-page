/** @jest-environment node */
import { mkdtemp, writeFile, rm } from "node:fs/promises";
import path from "node:path";
import { tmpdir } from "node:os";
import { prefetchItemsById, getCacheHealth } from "../prefetch";

const originalEnv = process.env;
let tempDir: string;

beforeAll(async () => {
  tempDir = await mkdtemp(path.join(tmpdir(), "idle-prefetch-"));
  process.env.MEDIA_BASE_PATH = tempDir;
});

afterAll(async () => {
  process.env = { ...originalEnv };
  await rm(tempDir, { recursive: true, force: true });
});

describe("prefetchItemsById", () => {
  it("returns empty prefetched/failed when itemIds is empty", async () => {
    const result = await prefetchItemsById([]);
    expect(result.prefetched).toEqual([]);
    expect(result.failed).toEqual([]);
  });

  it("skips non-remote items and returns empty when no remote ids", async () => {
    await writeFile(
      path.join(tempDir, "media-registry.json"),
      JSON.stringify({
        items: [
          { id: "local-1", type: "image", source: "local", uri: "/data/a.jpg", status: "ready" },
        ],
      }),
      "utf-8"
    );
    const result = await prefetchItemsById(["local-1"]);
    expect(result.prefetched).toEqual([]);
    expect(result.failed).toEqual([]);
  });
});

describe("getCacheHealth", () => {
  it("returns ok status and cache stats", async () => {
    const health = await getCacheHealth(2048);
    expect(health.status).toBe("ok");
    expect(health.cacheSizeBytes).toBe(0);
    expect(health.cacheLimitBytes).toBe(2048 * 1024 * 1024);
    expect(health.count).toBe(0);
  });
});
