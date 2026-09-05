import { describe, expect, it, vi } from "vitest";
import type { ProjectOverview } from "@/lib/github-projects";
import {
  collectActivitySnapshot,
  resolveActivitySnapshot,
  type ActivitySnapshot,
  type ActivitySnapshotStore,
  type GitHubActivitySource,
} from "@/lib/github-activity";

const project = (
  name: string,
  technologies: string[],
): ProjectOverview => ({
  name,
  fullName: `joneswxg/${name}`,
  githubUrl: `https://github.com/joneswxg/${name}`,
  technologies,
  topics: [],
});

describe("collectActivitySnapshot", () => {
  it("aggregates Owner Activity inside a 30-day Asia/Shanghai window", async () => {
    const commitsByProject = new Map([
      [
        "alpha",
        [
          { authorLogin: "joneswxg", authoredAt: "2026-08-05T10:00:00.000Z" },
          { authorLogin: "someone-else", authoredAt: "2026-09-03T08:00:00.000Z" },
        ],
      ],
      [
        "beta",
        [
          { authorLogin: "joneswxg", authoredAt: "2026-08-05T09:59:59.999Z" },
        ],
      ],
      [
        "gamma",
        [
          { authorLogin: "joneswxg", authoredAt: "2026-08-20T03:30:00.000Z" },
        ],
      ],
    ]);
    const source: GitHubActivitySource = {
      listCommits: vi.fn(async (repositoryName) =>
        commitsByProject.get(repositoryName) ?? [],
      ),
    };

    const snapshot = await collectActivitySnapshot({
      githubIdentity: "joneswxg",
      projects: [
        project("alpha", ["TypeScript", "CSS"]),
        project("beta", ["TypeScript"]),
        project("gamma", ["Python"]),
      ],
      source,
      now: new Date("2026-09-04T10:00:00.000Z"),
    });

    expect(snapshot).toEqual({
      schemaVersion: 1,
      githubIdentity: "joneswxg",
      collectedAt: "2026-09-04T10:00:00.000Z",
      source: "GitHub REST API",
      window: {
        timeZone: "Asia/Shanghai",
        durationDays: 30,
        startsAt: "2026-08-05T10:00:00.000Z",
        endsAt: "2026-09-04T10:00:00.000Z",
      },
      metrics: {
        eligibleProjectCount: 3,
        activeProjectCount: 2,
        mostRecentOwnerCommitAt: "2026-08-20T03:30:00.000Z",
        primaryLanguageDistribution: [
          { language: "TypeScript", projectCount: 2 },
          { language: "Python", projectCount: 1 },
        ],
      },
    });
  });
});

const snapshotAt = (collectedAt: string): ActivitySnapshot => ({
  schemaVersion: 1,
  githubIdentity: "joneswxg",
  collectedAt,
  source: "GitHub REST API",
  window: {
    timeZone: "Asia/Shanghai",
    durationDays: 30,
    startsAt: "2026-08-05T10:00:00.000Z",
    endsAt: collectedAt,
  },
  metrics: {
    eligibleProjectCount: 3,
    activeProjectCount: 2,
    mostRecentOwnerCommitAt: "2026-08-20T03:30:00.000Z",
    primaryLanguageDistribution: [
      { language: "TypeScript", projectCount: 2 },
      { language: "Python", projectCount: 1 },
    ],
  },
});

describe("resolveActivitySnapshot", () => {
  it("serves a snapshot younger than 24 hours without refreshing", async () => {
    const existing = snapshotAt("2026-09-03T10:00:01.000Z");
    const store: ActivitySnapshotStore = {
      load: vi.fn().mockResolvedValue(existing),
      save: vi.fn(),
    };
    const refresh = vi.fn();

    const result = await resolveActivitySnapshot({
      githubIdentity: "joneswxg",
      store,
      refresh,
      now: new Date("2026-09-04T10:00:00.000Z"),
    });

    expect(result).toEqual({ status: "fresh-snapshot", snapshot: existing });
    expect(refresh).not.toHaveBeenCalled();
    expect(store.save).not.toHaveBeenCalled();
  });

  it("serves an arbitrarily old snapshot when refresh fails", async () => {
    const existing = snapshotAt("2026-06-01T10:00:00.000Z");
    const store: ActivitySnapshotStore = {
      load: vi.fn().mockResolvedValue(existing),
      save: vi.fn(),
    };

    const result = await resolveActivitySnapshot({
      githubIdentity: "joneswxg",
      store,
      refresh: vi.fn().mockRejectedValue(new Error("GitHub unavailable")),
      now: new Date("2026-09-04T10:00:00.000Z"),
    });

    expect(result).toEqual({ status: "retained-snapshot", snapshot: existing });
    expect(store.save).not.toHaveBeenCalled();
  });

  it("refreshes and saves a snapshot when the stored value is exactly 24 hours old", async () => {
    const existing = snapshotAt("2026-09-03T10:00:00.000Z");
    const refreshed = snapshotAt("2026-09-04T10:00:00.000Z");
    const store: ActivitySnapshotStore = {
      load: vi.fn().mockResolvedValue(existing),
      save: vi.fn().mockResolvedValue(undefined),
    };

    const result = await resolveActivitySnapshot({
      githubIdentity: "joneswxg",
      store,
      refresh: vi.fn().mockResolvedValue(refreshed),
      now: new Date("2026-09-04T10:00:00.000Z"),
    });

    expect(result).toEqual({ status: "refreshed", snapshot: refreshed });
    expect(store.save).toHaveBeenCalledWith(refreshed);
  });

  it("returns an unavailable state when refresh fails without a stored snapshot", async () => {
    const store: ActivitySnapshotStore = {
      load: vi.fn().mockResolvedValue(null),
      save: vi.fn(),
    };

    const result = await resolveActivitySnapshot({
      githubIdentity: "joneswxg",
      store,
      refresh: vi.fn().mockRejectedValue(new Error("GitHub unavailable")),
      now: new Date("2026-09-04T10:00:00.000Z"),
    });

    expect(result).toEqual({ status: "unavailable", snapshot: null });
    expect(store.save).not.toHaveBeenCalled();
  });
});
