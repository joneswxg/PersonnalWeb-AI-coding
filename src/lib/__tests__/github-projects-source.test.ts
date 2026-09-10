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

  it("reads public GitHub data without a token when the API accepts anonymous requests", async () => {
    vi.stubEnv("GITHUB_TOKEN", "");
    vi.mocked(databaseActivitySnapshotStore.load).mockResolvedValueOnce(null);
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify([
            {
              name: "PersonnalWeb-AI-coding",
              full_name: "joneswxg/PersonnalWeb-AI-coding",
              html_url: "https://github.com/joneswxg/PersonnalWeb-AI-coding",
              private: false,
              archived: false,
              fork: false,
              description: "Personal portfolio",
              topics: ["nextjs"],
              updated_at: "2026-09-04T00:00:00Z",
              stargazers_count: 1,
              forks_count: 0,
            },
          ]),
          { status: 200 },
        ),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ TypeScript: 100 }), { status: 200 }),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify([
            {
              author: { login: "joneswxg" },
              commit: { author: { date: "2026-09-03T10:00:00Z" } },
            },
          ]),
          { status: 200 },
        ),
      );
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      loadPublicProjectDirectoryWithActivity(
        "zh",
        new Date("2026-09-04T10:00:00.000Z"),
      ),
    ).resolves.toMatchObject({
      directoryStatus: "available",
      projects: [
        {
          name: "PersonnalWeb-AI-coding",
          technologies: ["TypeScript"],
        },
      ],
      activity: {
        status: "refreshed",
        snapshot: {
          githubIdentity: "joneswxg",
          metrics: { eligibleProjectCount: 1, activeProjectCount: 1 },
        },
      },
    });
    expect(databaseActivitySnapshotStore.load).toHaveBeenCalledWith("joneswxg");
    expect(databaseActivitySnapshotStore.save).toHaveBeenCalledOnce();
    expect(fetchMock.mock.calls[0]?.[1]).not.toMatchObject({
      headers: expect.objectContaining({ Authorization: expect.any(String) }),
    });
  });
});
