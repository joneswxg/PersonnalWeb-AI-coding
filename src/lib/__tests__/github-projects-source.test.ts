import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("@/lib/activity-snapshot-store", () => ({
  databaseActivitySnapshotStore: {
    load: vi.fn(),
    save: vi.fn(),
  },
}));

import { databaseActivitySnapshotStore } from "@/lib/activity-snapshot-store";
import { loadPublicProjectDirectoryWithActivity } from "@/lib/github-projects-source";

describe("loadPublicProjectDirectoryWithActivity", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("returns an unavailable directory when no GitHub token is configured", async () => {
    vi.stubEnv("GITHUB_TOKEN", "");
    vi.mocked(databaseActivitySnapshotStore.load).mockResolvedValueOnce(null);

    await expect(
      loadPublicProjectDirectoryWithActivity(
        "zh",
        new Date("2026-09-04T10:00:00.000Z"),
      ),
    ).resolves.toEqual({
      directoryStatus: "unavailable",
      projects: [],
      activity: { status: "unavailable", snapshot: null },
    });
    expect(databaseActivitySnapshotStore.load).toHaveBeenCalledWith("joneswxg");
    expect(databaseActivitySnapshotStore.save).not.toHaveBeenCalled();
  });
});
