import { DEFAULT_SETTINGS } from "../settings";

describe("Settings types", () => {
  it("DEFAULT_SETTINGS has spec defaults", () => {
    expect(DEFAULT_SETTINGS.prefetchConcurrency).toBe(2);
    expect(DEFAULT_SETTINGS.remoteCacheLimitMb).toBe(2048);
    expect(DEFAULT_SETTINGS.rotationMode).toBe("random");
    expect(DEFAULT_SETTINGS.showCompleted).toBe(true);
    expect(DEFAULT_SETTINGS.todoFilePath).toBe("");
    expect(["random", "playlist"]).toContain(DEFAULT_SETTINGS.rotationMode);
    expect(DEFAULT_SETTINGS.designVariant).toBe("void-minimal");
    expect(["void-minimal", "glass-ambient"]).toContain(DEFAULT_SETTINGS.designVariant);
    expect(DEFAULT_SETTINGS.autoCheckpoint).toBe(false);
    expect(DEFAULT_SETTINGS.checkpointDebounceSec).toBe(10);
  });
});
