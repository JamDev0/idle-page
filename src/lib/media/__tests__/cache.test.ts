/** @jest-environment node */
import { mkdtemp, readFile, rm } from "node:fs/promises";
import path from "node:path";
import { tmpdir } from "node:os";
import {
  isAllowedRemoteUrl,
  getCachedPath,
  getCacheStats,
  fetchAndCache,
  ensureCacheLimit,
} from "../cache";

const originalEnv = process.env;
const originalFetch = globalThis.fetch;
let tempDir: string;

beforeAll(async () => {
  tempDir = await mkdtemp(path.join(tmpdir(), "idle-cache-"));
  process.env.MEDIA_BASE_PATH = tempDir;
});

afterAll(async () => {
  process.env = { ...originalEnv };
  await rm(tempDir, { recursive: true, force: true });
  globalThis.fetch = originalFetch;
});

describe("isAllowedRemoteUrl", () => {
  it("allows https and http URLs", () => {
    expect(isAllowedRemoteUrl("https://example.com/a.jpg")).toBe(true);
    expect(isAllowedRemoteUrl("http://example.com/b.png")).toBe(true);
  });

  it("rejects non-http(s) and invalid URLs", () => {
    expect(isAllowedRemoteUrl("file:///etc/passwd")).toBe(false);
    expect(isAllowedRemoteUrl("ftp://example.com/x")).toBe(false);
    expect(isAllowedRemoteUrl("")).toBe(false);
    expect(isAllowedRemoteUrl("not-a-url")).toBe(false);
  });
});

describe("getCachedPath", () => {
  it("returns null for disallowed URL", async () => {
    expect(await getCachedPath("file:///tmp/x")).toBe(null);
  });

  it("returns null when manifest is empty", async () => {
    expect(await getCachedPath("https://example.com/missing.jpg")).toBe(null);
  });
});

describe("getCacheStats", () => {
  it("returns zero size and count when cache is empty", async () => {
    const stats = await getCacheStats(2048);
    expect(stats.sizeBytes).toBe(0);
    expect(stats.count).toBe(0);
    expect(stats.limitBytes).toBe(2048 * 1024 * 1024);
  });
});

describe("fetchAndCache", () => {
  it("rejects disallowed URL", async () => {
    await expect(
      fetchAndCache("file:///etc/passwd", 1024 * 1024)
    ).rejects.toThrow("Invalid or disallowed");
  });

  it("fetches and caches when fetch succeeds", async () => {
    const body = new Uint8Array([1, 2, 3]);
    globalThis.fetch = async (url: string | URL) => {
      const u = typeof url === "string" ? url : url.toString();
          if (u.startsWith("https://example.com/ok")) {
            return new Response(body, {
              status: 200,
              headers: { "Content-Type": "image/png" },
            });
          }
          return new Response("not found", { status: 404 });
        };
    const limitBytes = 10 * 1024 * 1024;
    const cached = await fetchAndCache("https://example.com/ok.png", limitBytes);
    expect(cached).toBeTruthy();
    expect(path.isAbsolute(cached)).toBe(true);
    const raw = await readFile(cached);
    expect(Buffer.compare(raw, Buffer.from(body))).toBe(0);
    const pathAgain = await getCachedPath("https://example.com/ok.png");
    expect(pathAgain).toBe(cached);
  });

  it("retries on failure and succeeds on second attempt (spec §11.2 retry then skip)", async () => {
    const body = new Uint8Array([4, 5, 6]);
    let callCount = 0;
    globalThis.fetch = async (url: string | URL) => {
      const u = typeof url === "string" ? url : url.toString();
      callCount += 1;
      if (u.startsWith("https://example.com/retry")) {
        if (callCount === 1) return new Response("error", { status: 500 });
        return new Response(body, {
          status: 200,
          headers: { "Content-Type": "image/png" },
        });
      }
      return new Response("not found", { status: 404 });
    };
    const limitBytes = 10 * 1024 * 1024;
    const cached = await fetchAndCache("https://example.com/retry.png", limitBytes);
    expect(callCount).toBe(2);
    expect(cached).toBeTruthy();
    const raw = await readFile(cached);
    expect(Buffer.compare(raw, Buffer.from(body))).toBe(0);
  });

  it("throws after max attempts so caller can skip (retry then skip)", async () => {
    let callCount = 0;
    globalThis.fetch = async () => {
      callCount += 1;
      return new Response("error", { status: 503 });
    };
    const limitBytes = 10 * 1024 * 1024;
    await expect(
      fetchAndCache("https://example.com/fail.png", limitBytes)
    ).rejects.toThrow();
    expect(callCount).toBe(2);
  });
});

describe("ensureCacheLimit", () => {
  it("returns stats and creates manifest when cache dir missing", async () => {
    const otherDir = await mkdtemp(path.join(tmpdir(), "idle-cache-limit-"));
    process.env.MEDIA_BASE_PATH = otherDir;
    const stats = await ensureCacheLimit(2048);
    expect(stats.sizeBytes).toBe(0);
    expect(stats.count).toBe(0);
    process.env.MEDIA_BASE_PATH = tempDir;
    await rm(otherDir, { recursive: true, force: true });
  });
});
