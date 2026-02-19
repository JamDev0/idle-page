import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { tmpdir } from "node:os";
import {
  readMediaRegistry,
  writeMediaRegistry,
  addMediaItems,
  resolveLocalUri,
  isPathUnderMediaBase,
  type MediaRegistry,
} from "../registry";

const originalEnv = process.env;
let tempDir: string;

beforeAll(async () => {
  tempDir = await mkdtemp(path.join(tmpdir(), "idle-media-"));
  process.env.MEDIA_BASE_PATH = tempDir;
});

afterAll(async () => {
  process.env = { ...originalEnv };
  await rm(tempDir, { recursive: true, force: true });
});

describe("readMediaRegistry", () => {
  it("returns default when file does not exist", async () => {
    process.env.MEDIA_BASE_PATH = path.join(tempDir, "nonexistent-subdir");
    const reg = await readMediaRegistry();
    expect(reg).toEqual({ items: [] });
  });

  it("returns parsed items when file exists", async () => {
    const regPath = path.join(tempDir, "media-registry.json");
    await writeFile(
      regPath,
      JSON.stringify({
        items: [
          {
            id: "m1",
            type: "image",
            source: "remote",
            uri: "https://example.com/a.jpg",
            status: "ready",
          },
        ],
      }),
      "utf-8"
    );
    process.env.MEDIA_BASE_PATH = tempDir;
    const reg = await readMediaRegistry();
    expect(reg.items).toHaveLength(1);
    expect(reg.items[0].id).toBe("m1");
    expect(reg.items[0].uri).toBe("https://example.com/a.jpg");
  });

  it("returns default when file is invalid JSON", async () => {
    const otherDir = await mkdtemp(path.join(tmpdir(), "idle-media-invalid-"));
    process.env.MEDIA_BASE_PATH = otherDir;
    await writeFile(path.join(otherDir, "media-registry.json"), "not json", "utf-8");
    const reg = await readMediaRegistry();
    expect(reg).toEqual({ items: [] });
    await rm(otherDir, { recursive: true, force: true });
  });
});

describe("writeMediaRegistry", () => {
  it("writes and round-trips", async () => {
    process.env.MEDIA_BASE_PATH = tempDir;
    const registry: MediaRegistry = {
      items: [
        {
          id: "w1",
          type: "quote",
          source: "inline",
          uri: "",
          title: "Hello",
          status: "ready",
        },
      ],
    };
    await writeMediaRegistry(registry);
    const raw = await readFile(path.join(tempDir, "media-registry.json"), "utf-8");
    const parsed = JSON.parse(raw) as MediaRegistry;
    expect(parsed.items).toHaveLength(1);
    expect(parsed.items[0].title).toBe("Hello");
  });
});

describe("addMediaItems", () => {
  it("adds remote item with inferred type", async () => {
    process.env.MEDIA_BASE_PATH = tempDir;
    const added = await addMediaItems([
      { source: "remote", uri: "https://example.com/vid.mp4" },
    ]);
    expect(added).toHaveLength(1);
    expect(added[0].type).toBe("video");
    expect(added[0].source).toBe("remote");
    expect(added[0].uri).toBe("https://example.com/vid.mp4");
    expect(added[0].id).toMatch(/^media-/);
    expect(added[0].status).toBe("ready");
  });

  it("adds local item with normalized path under base", async () => {
    const assetsDir = path.join(tempDir, "assets");
    const { mkdir } = await import("node:fs/promises");
    await mkdir(assetsDir, { recursive: true });
    await writeFile(path.join(assetsDir, "dummy.txt"), "", "utf-8");
    process.env.MEDIA_BASE_PATH = tempDir;
    const relPath = path.join("assets", "dummy.txt");
    const added = await addMediaItems([{ source: "local", uri: relPath }]);
    expect(added).toHaveLength(1);
    expect(added[0].source).toBe("local");
    expect(path.isAbsolute(added[0].uri)).toBe(true);
    expect(added[0].uri).toContain("assets");
  });

  it("skips local item when path is outside base", async () => {
    process.env.MEDIA_BASE_PATH = tempDir;
    const added = await addMediaItems([
      { source: "local", uri: "/etc/passwd" },
    ]);
    expect(added).toHaveLength(0);
  });

  it("uses quote type for inline source when type not given", async () => {
    process.env.MEDIA_BASE_PATH = tempDir;
    const added = await addMediaItems([
      { source: "inline", uri: "", title: "A quote" },
    ]);
    expect(added).toHaveLength(1);
    expect(added[0].type).toBe("quote");
    expect(added[0].title).toBe("A quote");
  });
});

describe("resolveLocalUri", () => {
  beforeAll(() => {
    process.env.MEDIA_BASE_PATH = tempDir;
  });

  it("returns null for http URL", () => {
    expect(resolveLocalUri("https://example.com/x.jpg")).toBe(null);
    expect(resolveLocalUri("http://example.com/x.jpg")).toBe(null);
  });

  it("returns null for data URI", () => {
    expect(resolveLocalUri("data:image/png;base64,abc")).toBe(null);
  });

  it("returns normalized path for relative path under base", () => {
    const result = resolveLocalUri("img.png");
    expect(result).toBe(path.join(tempDir, "img.png"));
  });
});

describe("isPathUnderMediaBase", () => {
  beforeAll(() => {
    process.env.MEDIA_BASE_PATH = tempDir;
  });

  it("returns true for path under base", () => {
    expect(isPathUnderMediaBase(path.join(tempDir, "a", "b.jpg"))).toBe(true);
    expect(isPathUnderMediaBase(tempDir)).toBe(true);
  });

  it("returns false for path outside base", () => {
    expect(isPathUnderMediaBase("/tmp/other")).toBe(false);
    expect(isPathUnderMediaBase(path.join(tempDir, "..", "other"))).toBe(false);
  });
});
