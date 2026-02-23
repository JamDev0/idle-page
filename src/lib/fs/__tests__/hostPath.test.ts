import path from "node:path";
import { getMediaBasePath, normalizeMediaPath } from "../hostPath";

const originalEnv = process.env;

describe("getMediaBasePath", () => {
  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it("returns process.cwd() when MEDIA_BASE_PATH is unset", () => {
    delete process.env.MEDIA_BASE_PATH;
    expect(getMediaBasePath()).toBe(process.cwd());
  });

  it("returns MEDIA_BASE_PATH when set", () => {
    process.env.MEDIA_BASE_PATH = "/data/media";
    expect(getMediaBasePath()).toBe("/data/media");
  });
});

describe("normalizeMediaPath", () => {
  const base = path.resolve(process.cwd(), "data");

  beforeAll(() => {
    process.env.MEDIA_BASE_PATH = base;
  });

  afterAll(() => {
    process.env = { ...originalEnv };
  });

  it("returns null for empty or invalid input", () => {
    expect(normalizeMediaPath("")).toBe(null);
    expect(normalizeMediaPath("   ")).toBe(null);
    expect(normalizeMediaPath(null as unknown as string)).toBe(null);
  });

  it("resolves relative path under base", () => {
    const resolved = normalizeMediaPath("photo.jpg");
    expect(resolved).toBe(path.join(base, "photo.jpg"));
  });

  it("returns null when path escapes base", () => {
    expect(normalizeMediaPath("../../../etc/passwd")).toBe(null);
    const outside = path.resolve(base, "..", "other", "file.jpg");
    expect(normalizeMediaPath(outside)).toBe(null);
  });

  it("accepts path already under base", () => {
    const under = path.join(base, "sub", "img.png");
    expect(normalizeMediaPath(under)).toBe(path.resolve(under));
  });
});
