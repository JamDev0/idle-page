import { parseTodoMarkdown, parseTodoFile } from "../parser";

describe("parseTodoMarkdown", () => {
  it("parses only checklist lines and ignores non-checklist content", () => {
    const content = [
      "# My list",
      "",
      "- [ ] First",
      "- [x] Done",
      "Some prose",
      "- [ ] Second",
      "",
    ].join("\n");
    const result = parseTodoMarkdown(content);
    expect(result.tasks).toHaveLength(3);
    expect(result.tasks[0].text).toBe("First");
    expect(result.tasks[0].checked).toBe(false);
    expect(result.tasks[1].text).toBe("Done");
    expect(result.tasks[1].checked).toBe(true);
    expect(result.tasks[2].text).toBe("Second");
    expect(result.fileHealth).toBe("ok");
  });

  it("extracts existing idle-id from lines", () => {
    const content = "- [ ] Buy milk <!-- idle-id:abc123 -->\n";
    const result = parseTodoMarkdown(content);
    expect(result.tasks).toHaveLength(1);
    expect(result.tasks[0].id).toBe("abc123");
    expect(result.tasks[0].text).toBe("Buy milk");
  });

  it("injects deterministic ID for lines without idle-id", () => {
    const content = "- [ ] No id yet\n";
    const result = parseTodoMarkdown(content);
    expect(result.tasks).toHaveLength(1);
    expect(result.tasks[0].id).toMatch(/^[a-f0-9]{12}$/);
    const again = parseTodoMarkdown(content);
    expect(again.tasks[0].id).toBe(result.tasks[0].id);
  });

  it("preserves lineRef and rawLine", () => {
    const content = "head\n- [ ] item\n";
    const result = parseTodoMarkdown(content);
    expect(result.tasks[0].lineRef).toBe(1);
    expect(result.tasks[0].rawLine).toBe("- [ ] item");
  });

  it("accepts [X] as checked", () => {
    const content = "- [X] Done\n";
    const result = parseTodoMarkdown(content);
    expect(result.tasks[0].checked).toBe(true);
  });
});

describe("parseTodoFile", () => {
  it("returns unreadable when content is null", () => {
    const result = parseTodoFile("/path", null);
    expect(result.fileHealth).toBe("unreadable");
    expect(result.tasks).toHaveLength(0);
    expect(result.parseWarnings).toContain("File not found or not readable.");
  });

  it("parses content and sets lastModified", () => {
    const result = parseTodoFile("/path", "- [ ] One\n", "2026-01-01T00:00:00Z");
    expect(result.fileHealth).toBe("ok");
    expect(result.tasks).toHaveLength(1);
    expect(result.lastModified).toBe("2026-01-01T00:00:00Z");
  });
});
