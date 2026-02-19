import {
  buildChecklistLine,
  patchLine,
  insertLineAfter,
  removeLine,
  linesToContent,
} from "../serializer";

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
