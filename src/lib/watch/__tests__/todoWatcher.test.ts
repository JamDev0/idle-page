/**
 * Tests for TODO file watcher: health callbacks, close (spec §10.1, §10.2).
 * Change-event propagation depends on OS/fs; integration or E2E can cover it.
 */
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createTodoWatcher } from "../todoWatcher";

describe("createTodoWatcher", () => {
  let tmpDir: string;
  let filePath: string;

  beforeAll(() => {
    tmpDir = mkdtempSync(join(tmpdir(), "idle-watcher-"));
    filePath = join(tmpDir, "TO-DO.md");
    writeFileSync(filePath, "- [ ] initial\n", "utf-8");
  });

  afterAll(() => {
    rmSync(tmpDir, { recursive: true });
  });

  it("emits watching on start", async () => {
    const healthEvents: Array<{ status: string; message?: string }> = [];

    const { close } = createTodoWatcher(filePath, {
      onChange: () => {},
      onHealthChange: (status, message) => {
        healthEvents.push({ status, message });
      },
    });

    await new Promise((r) => setTimeout(r, 400));
    expect(healthEvents.some((e) => e.status === "watching")).toBe(true);
    close();
  });

  it("stops emitting after close()", async () => {
    let changeCount = 0;
    const { close } = createTodoWatcher(filePath, {
      onChange: () => {
        changeCount += 1;
      },
      onHealthChange: () => {},
    });

    await new Promise((r) => setTimeout(r, 100));
    close();
    writeFileSync(filePath, "- [ ] after close\n", "utf-8");
    await new Promise((r) => setTimeout(r, 300));

    expect(changeCount).toBe(0);
  });
});
