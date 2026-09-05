import { readFile } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  buildPortfolioProfilePresentation,
  parsePortfolioProfileMarkdown,
} from "@/lib/portfolio-profile";
import { buildPortfolioHome } from "@/lib/portfolio-home";
import type { ProjectOverview } from "@/lib/github-projects";
import type { ActivitySnapshotResult } from "@/lib/github-activity";
import type { ArticleCardData } from "@/lib/article-queries";

const fixturePath = path.join(
  process.cwd(),
  "src/lib/__tests__/fixtures/profile-complete.md",
);
const portfolioSourcePath = path.join(
  process.cwd(),
  "content/portfolio-profile.md",
);

const project = (name: string): ProjectOverview => ({
  name,
  fullName: `example/${name}`,
  githubUrl: `https://github.com/example/${name}`,
  technologies: ["TypeScript"],
  topics: [],
});

const activity: ActivitySnapshotResult = {
  status: "fresh-snapshot",
  snapshot: {
    schemaVersion: 1,
    githubIdentity: "example",
    collectedAt: "2026-09-04T10:00:00.000Z",
    source: "GitHub REST API",
    window: {
      timeZone: "Asia/Shanghai",
      durationDays: 30,
      startsAt: "2026-08-05T10:00:00.000Z",
      endsAt: "2026-09-04T10:00:00.000Z",
    },
    metrics: {
      eligibleProjectCount: 4,
      activeProjectCount: 2,
      primaryLanguageDistribution: [
        { language: "TypeScript", projectCount: 4 },
      ],
    },
  },
};

const article = (id: number): ArticleCardData => ({
  id,
  title: `Article ${id}`,
  slug: `article-${id}`,
  status: "public",
  excerpt: `Excerpt ${id}`,
  updatedAt: new Date(`2026-09-0${id}T10:00:00.000Z`),
  categoryName: null,
  categorySlug: null,
  tags: [],
});

describe("buildPortfolioHome", () => {
  it("composes three configured Featured Projects and three visible journal previews", async () => {
    const markdown = await readFile(fixturePath, "utf8");
    const portfolio = buildPortfolioProfilePresentation(
      parsePortfolioProfileMarkdown(markdown),
      "zh",
    );

    const home = buildPortfolioHome({
      portfolio,
      directory: {
        directoryStatus: "available",
        projects: [
          project("project-three"),
          project("project-one"),
          project("other-project"),
          project("project-two"),
        ],
        activity,
      },
      visibleArticles: [article(4), article(3), article(2), article(1)],
    });

    expect(home.featuredProjects.map((item) => item.name)).toEqual([
      "project-one",
      "project-two",
      "project-three",
    ]);
    expect(home.featuredProjects[0]?.summary).toBe("本地项目简介一。");
    expect(home.featuredProjects[1]?.technologies).toEqual(["Go"]);
    expect(home.activity).toBe(activity);
    expect(home.journalPreview.map((item) => item.id)).toEqual([4, 3, 2]);
  });

  it("rejects a Portfolio Home configuration that does not name exactly three projects", async () => {
    const markdown = await readFile(fixturePath, "utf8");
    const portfolio = buildPortfolioProfilePresentation(
      parsePortfolioProfileMarkdown(markdown),
      "zh",
    );
    portfolio.featuredProjects = [portfolio.featuredProjects[0]!];

    expect(() =>
      buildPortfolioHome({
        portfolio,
        directory: {
          directoryStatus: "available",
          projects: [project("project-one")],
          activity,
        },
        visibleArticles: [],
      }),
    ).toThrow("exactly three Featured Projects");
  });

  it("keeps exactly three configured project links when GitHub is unavailable", async () => {
    const markdown = await readFile(fixturePath, "utf8");
    const portfolio = buildPortfolioProfilePresentation(
      parsePortfolioProfileMarkdown(markdown),
      "zh",
    );

    const home = buildPortfolioHome({
      portfolio,
      directory: {
        directoryStatus: "unavailable",
        projects: [],
        activity: { status: "unavailable", snapshot: null },
      },
      visibleArticles: [],
    });

    expect(home.featuredProjects.map((item) => item.name)).toEqual([
      "project-one",
      "project-two",
      "project-three",
    ]);
    expect(home.featuredProjects[0]?.githubUrl).toBe(
      "https://github.com/example/project-one",
    );
    expect(home.featuredProjects[0]?.summary).toBe("本地项目简介一。");
    expect(home.featuredProjects[0]?.technologies).toEqual([
      "TypeScript",
      "Next.js",
    ]);
  });

  it("keeps the Git-Managed Profile Data configured with three Featured Projects", async () => {
    const markdown = await readFile(portfolioSourcePath, "utf8");
    const portfolio = parsePortfolioProfileMarkdown(markdown);

    expect(
      portfolio.featuredProjects.map((project) => project.repository),
    ).toEqual(["GIF-Download-Tool", "sub2api-ha", "todo-list-app"]);
    expect(
      portfolio.projectRules.admittedForks.map((fork) => ({
        repository: fork.repository,
        upstream: fork.upstream,
      })),
    ).toEqual([
      { repository: "sub2api-ha", upstream: "Wei-Shaw/sub2api" },
      { repository: "todo-list-app", upstream: "zjx-immersion/todo-list-app" },
    ]);
  });
});
