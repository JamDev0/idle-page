import { mkdtemp, readdir, readFile, unlink, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { createBackup, pruneBackups } from "../backup";

describe("backup", () => {
  let tmpDir: string;

  beforeAll(async () => {
    tmpDir = await mkdtemp(path.join(os.tmpdir(), "idle-backup-"));
  });

  afterAll(async () => {
    try {
      const entries = await readdir(tmpDir);
      for (const e of entries) {
        await unlink(path.join(tmpDir, e));
      }
    } catch {
      // ignore
    }
  });

  describe("createBackup", () => {
    it("writes a backup file with content and .bak.YYYYMMDD-HHMMSS suffix", async () => {
      const filePath = path.join(tmpDir, "TO-DO.md");
      await writeFile(filePath, "- [ ] one\n", "utf-8");
      const backupPath = await createBackup(filePath, "- [ ] one\n- [ ] two\n");
      expect(backupPath).toContain("TO-DO.md.bak.");
      expect(backupPath).toMatch(/\.bak\.\d{8}-\d{6}$/);
      const content = await readFile(backupPath, "utf-8");
      expect(content).toBe("- [ ] one\n- [ ] two\n");
    });
  });

  describe("pruneBackups", () => {
    it("keeps keepCount backups and removes older ones", async () => {
      const filePath = path.join(tmpDir, "List.md");
      await writeFile(filePath, "x", "utf-8");
      jest.useFakeTimers({ now: new Date("2026-02-19T12:00:00Z") });
      const created: string[] = [];
      for (let i = 0; i < 7; i++) {
        const p = await createBackup(filePath, `content ${i}`);
        created.push(p);
        jest.advanceTimersByTime(1000);
      }
      jest.useRealTimers();

      const removed = await pruneBackups(filePath, 5);
      expect(removed.length).toBe(2);
      const entries = await readdir(tmpDir);
      const backups = entries.filter((e) => e.startsWith("List.md.bak."));
      expect(backups.length).toBe(5);
    });

    it("removes nothing when count is within keepCount", async () => {
      const filePath = path.join(tmpDir, "Few.md");
      await writeFile(filePath, "x", "utf-8");
      await createBackup(filePath, "a");
      const removed = await pruneBackups(filePath, 5);
      expect(removed).toEqual([]);
    });
  });
});
