import { describe, expect, it, vi } from "vitest";
import type { ActivitySnapshotStore } from "@/lib/github-activity";
import type { GitHubRepository } from "@/lib/github-projects";
import { resolvePublicProjectDirectory } from "@/lib/portfolio-project-directory";

describe("resolvePublicProjectDirectory", () => {
  it("retains the latest Activity Snapshot when a GitHub language refresh fails", async () => {
    const repository: GitHubRepository = {
      name: "portfolio",
      fullName: "joneswxg/portfolio",
      githubUrl: "https://github.com/joneswxg/portfolio",
      isPrivate: false,
      isArchived: false,
      isFork: false,
    };
    const retainedSnapshot = {
      schemaVersion: 1,
      githubIdentity: "joneswxg",
      collectedAt: "2026-06-01T10:00:00.000Z",
      source: "GitHub REST API",
      window: {
        timeZone: "Asia/Shanghai",
        durationDays: 30,
        startsAt: "2026-05-02T10:00:00.000Z",
        endsAt: "2026-06-01T10:00:00.000Z",
      },
      metrics: {
        eligibleProjectCount: 1,
        activeProjectCount: 1,
        primaryLanguageDistribution: [
          { language: "TypeScript", projectCount: 1 },
        ],
      },
    } as const;
    const store: ActivitySnapshotStore = {
      load: vi.fn().mockResolvedValue(retainedSnapshot),
      save: vi.fn(),
    };

    const result = await resolvePublicProjectDirectory({
      githubIdentity: "joneswxg",
      source: {
        listRepositories: vi.fn().mockResolvedValue([repository]),
        listLanguages: vi.fn().mockRejectedValue(new Error("GitHub unavailable")),
        listCommits: vi.fn(),
      },
      projectRules: { excludedRepositories: [], admittedForks: [] },
      store,
      now: new Date("2026-09-04T10:00:00.000Z"),
    });

    expect(result).toEqual({
      directoryStatus: "unavailable",
      projects: [],
      activity: {
        status: "retained-snapshot",
        snapshot: retainedSnapshot,
      },
    });
    expect(store.save).not.toHaveBeenCalled();
  });
});
