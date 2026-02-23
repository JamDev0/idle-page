/**
 * @jest-environment node
 */
import { mkdtemp, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { attemptCheckpoint } from "../checkpoint";

describe("attemptCheckpoint", () => {
  it("returns ok: false when path is not in a git repository", async () => {
    const tmpDir = await mkdtemp(path.join(os.tmpdir(), "idle-checkpoint-"));
    const filePath = path.join(tmpDir, "TO-DO.md");
    await writeFile(filePath, "- [ ] task\n", "utf-8");
    const result = attemptCheckpoint(filePath);
    expect(result.ok).toBe(false);
    expect("reason" in result && result.reason).toMatch(/not a git repository|git not available/i);
  });
});
