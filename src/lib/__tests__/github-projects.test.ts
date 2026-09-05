import { describe, expect, it, vi } from "vitest";
import {
  buildPublicProjectDirectory,
  type GitHubProjectSource,
  type GitHubRepository,
} from "@/lib/github-projects";

const repository = (
  overrides: Partial<GitHubRepository> & Pick<GitHubRepository, "name">,
): GitHubRepository => {
  const { name, ...rest } = overrides;
  return {
    name,
    fullName: `joneswxg/${name}`,
    githubUrl: `https://github.com/joneswxg/${name}`,
    isPrivate: false,
    isArchived: false,
    isFork: false,
    ...rest,
  };
};

describe("buildPublicProjectDirectory", () => {
  it("admits eligible originals, applies exclusions, and requires attribution for forks", async () => {
    const repositories = [
      repository({ name: "portfolio" }),
      repository({ name: "typescript-tutorial" }),
      repository({ name: "archived-tool", isArchived: true }),
      repository({ name: "private-notes", isPrivate: true }),
      repository({ name: "adapted-fork", isFork: true }),
      repository({ name: "unattributed-fork", isFork: true }),
    ];
    const source: GitHubProjectSource = {
      listRepositories: vi.fn().mockResolvedValue(repositories),
      listLanguages: vi.fn().mockResolvedValue({}),
    };

    const projects = await buildPublicProjectDirectory({
      source,
      projectRules: {
        excludedRepositories: ["typescript-tutorial"],
        admittedForks: [
          {
            repository: "adapted-fork",
            upstream: "example/original",
            attribution: "重构了数据模型并新增离线支持。",
          },
        ],
      },
    });

    expect(projects.map((project) => project.name)).toEqual([
      "adapted-fork",
      "portfolio",
    ]);
    expect(projects[0].attribution).toEqual({
      upstream: "example/original",
      summary: "重构了数据模型并新增离线支持。",
    });
  });

  it("maps repository and language responses into a Project Overview", async () => {
    const source: GitHubProjectSource = {
      listRepositories: vi.fn().mockResolvedValue([
        repository({
          name: "portfolio",
          summary: "A recruiter-first engineering portfolio.",
          topics: ["nextjs", "portfolio"],
          updatedAt: "2026-08-31T10:15:00Z",
          stars: 12,
          forks: 3,
        }),
      ]),
      listLanguages: vi.fn().mockResolvedValue({
        CSS: 1_000,
        JavaScript: 2_000,
        TypeScript: 4_000,
      }),
    };

    const projects = await buildPublicProjectDirectory({
      source,
      projectRules: { excludedRepositories: [], admittedForks: [] },
    });

    expect(projects).toEqual([
      {
        name: "portfolio",
        fullName: "joneswxg/portfolio",
        githubUrl: "https://github.com/joneswxg/portfolio",
        summary: "A recruiter-first engineering portfolio.",
        technologies: ["TypeScript", "JavaScript", "CSS"],
        topics: ["nextjs", "portfolio"],
        updatedAt: "2026-08-31T10:15:00Z",
        stars: 12,
        forks: 3,
      },
    ]);
    expect(source.listLanguages).toHaveBeenCalledWith("portfolio");
  });

  it("omits unavailable optional GitHub fields without rejecting the project", async () => {
    const source: GitHubProjectSource = {
      listRepositories: vi.fn().mockResolvedValue([
        repository({ name: "minimal-project" }),
      ]),
      listLanguages: vi.fn().mockResolvedValue({}),
    };

    const projects = await buildPublicProjectDirectory({
      source,
      projectRules: { excludedRepositories: [], admittedForks: [] },
    });

    expect(projects).toEqual([
      {
        name: "minimal-project",
        fullName: "joneswxg/minimal-project",
        githubUrl: "https://github.com/joneswxg/minimal-project",
        technologies: [],
        topics: [],
      },
    ]);
  });
});
