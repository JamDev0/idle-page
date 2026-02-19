import {
  buildChecklistLine,
  patchLine,
  insertLineAfter,
  removeLine,
  linesToContent,
  validateReorderWindow,
  applyReorder,
} from "../serializer";
import type { Task } from "@/types/task";

describe("buildChecklistLine", () => {
  it("builds unchecked line with idle-id comment", () => {
    const line = buildChecklistLine({
      text: "Buy milk",
      checked: false,
      id: "abc123",
    });
    expect(line).toBe("- [ ] Buy milk <!-- idle-id:abc123 -->");
  });

  it("builds checked line", () => {
    const line = buildChecklistLine({
      text: "Done",
      checked: true,
      id: "x",
    });
    expect(line).toContain("[x]");
    expect(line).toContain("idle-id:x");
  });
});

describe("patchLine", () => {
  it("replaces line at index", () => {
    const lines = ["a", "b", "c"];
    expect(patchLine(lines, 1, "B")).toEqual(["a", "B", "c"]);
  });

  it("returns copy unchanged when index out of range", () => {
    const lines = ["a"];
    expect(patchLine(lines, 1, "x")).toEqual(["a"]);
    expect(patchLine(lines, -1, "x")).toEqual(["a"]);
  });
});

describe("insertLineAfter", () => {
  it("inserts after index", () => {
    const lines = ["a", "b"];
    expect(insertLineAfter(lines, 0, "x")).toEqual(["a", "x", "b"]);
  });

  it("inserts at start when afterIndex is -1", () => {
    const lines = ["a"];
    expect(insertLineAfter(lines, -1, "x")).toEqual(["x", "a"]);
  });
});

describe("removeLine", () => {
  it("removes line at index", () => {
    const lines = ["a", "b", "c"];
    expect(removeLine(lines, 1)).toEqual(["a", "c"]);
  });

  it("returns copy unchanged when index out of range", () => {
    const lines = ["a"];
    expect(removeLine(lines, 1)).toEqual(["a"]);
  });
});

describe("linesToContent", () => {
  it("joins with \\n when original has no CRLF", () => {
    expect(linesToContent(["a", "b"], "a\nb")).toBe("a\nb");
  });

  it("joins with \\r\\n when original has CRLF", () => {
    expect(linesToContent(["a", "b"], "a\r\nb")).toBe("a\r\nb");
  });
});

function task(id: string, lineRef: number, rawLine: string): Task {
  return {
    id,
    text: id,
    checked: false,
    lineRef,
    rawLine,
  };
}

describe("validateReorderWindow", () => {
  it("returns ok and range for contiguous block", () => {
    const tasks: Task[] = [
      task("a", 0, "- [ ] A"),
      task("b", 1, "- [ ] B"),
      task("c", 2, "- [ ] C"),
    ];
    const v = validateReorderWindow(tasks, ["b", "a", "c"]);
    expect(v.ok).toBe(true);
    if (v.ok) {
      expect(v.minLineRef).toBe(0);
      expect(v.maxLineRef).toBe(2);
    }
  });

  it("rejects empty orderedTaskIds", () => {
    const tasks: Task[] = [task("a", 0, "- [ ] A")];
    const v = validateReorderWindow(tasks, []);
    expect(v.ok).toBe(false);
    if (!v.ok) expect(v.reason).toContain("non-empty array");
  });

  it("rejects unknown task id", () => {
    const tasks: Task[] = [task("a", 0, "- [ ] A")];
    const v = validateReorderWindow(tasks, ["a", "x"]);
    expect(v.ok).toBe(false);
    if (!v.ok) expect(v.reason).toContain("Unknown task id");
  });

  it("rejects non-contiguous block (gap)", () => {
    const tasks: Task[] = [
      task("a", 0, "- [ ] A"),
      task("b", 1, "- [ ] B"),
      task("c", 3, "- [ ] C"),
    ];
    const v = validateReorderWindow(tasks, ["a", "b", "c"]);
    expect(v.ok).toBe(false);
    if (!v.ok) expect(v.reason).toContain("contiguous");
  });

  it("rejects when mixed content in range (fewer tasks than span)", () => {
    const tasks: Task[] = [
      task("a", 0, "- [ ] A"),
      task("c", 2, "- [ ] C"),
    ];
    const v = validateReorderWindow(tasks, ["a", "c"]);
    expect(v.ok).toBe(false);
    if (!v.ok) expect(v.reason).toContain("contiguous");
  });
});

describe("applyReorder", () => {
  it("reorders contiguous block and preserves rest", () => {
    const lines = ["# Head", "- [ ] A", "- [ ] B", "- [ ] C", "Footer"];
    const tasks: Task[] = [
      task("a", 1, "- [ ] A"),
      task("b", 2, "- [ ] B"),
      task("c", 3, "- [ ] C"),
    ];
    const out = applyReorder(lines, tasks, ["c", "a", "b"], 1, 3);
    expect(out).toEqual(["# Head", "- [ ] C", "- [ ] A", "- [ ] B", "Footer"]);
  });
});
