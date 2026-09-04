import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("@/lib/roles", () => ({ getRole: vi.fn() }));
vi.mock("@/lib/article-queries", () => ({ listArticlesForRole: vi.fn() }));
vi.mock("@/lib/portfolio-profile-source", () => ({
  loadPortfolioProfilePresentation: vi.fn(),
}));
vi.mock("@/lib/github-projects-source", () => ({
  loadPublicProjectDirectoryWithActivity: vi.fn(),
}));

import { getRole } from "@/lib/roles";
import { listArticlesForRole } from "@/lib/article-queries";
import { loadPortfolioProfilePresentation } from "@/lib/portfolio-profile-source";
import { loadPublicProjectDirectoryWithActivity } from "@/lib/github-projects-source";
import { loadPortfolioHome } from "@/lib/portfolio-home-source";
import type { PortfolioProfilePresentation } from "@/lib/portfolio-profile";

const portfolio: PortfolioProfilePresentation = {
  locale: "zh",
  profile: {
    name: "Jones",
    title: "Engineer",
    summary: "Summary",
    avatarSrc: "https://assets.example.com/avatar.webp",
    avatarAlt: "Jones",
    githubUrl: "https://github.com/joneswxg",
  },
  skills: [],
  experience: [],
  education: [],
  certifications: [],
  featuredProjects: ["one", "two", "three"],
  projectRules: { excludedRepositories: [], admittedForks: [] },
};

describe("loadPortfolioHome", () => {
  it("uses the current role's Technical Journal visibility result", async () => {
    vi.mocked(getRole).mockResolvedValueOnce("visitor");
    vi.mocked(loadPortfolioProfilePresentation).mockResolvedValueOnce(portfolio);
    vi.mocked(loadPublicProjectDirectoryWithActivity).mockResolvedValueOnce({
      directoryStatus: "unavailable",
      projects: [],
      activity: { status: "unavailable", snapshot: null },
    });
    vi.mocked(listArticlesForRole).mockResolvedValueOnce([
      {
        id: 1,
        title: "Public article",
        slug: "public-article",
        status: "public",
        excerpt: "Visible to visitors",
        updatedAt: new Date("2026-09-04T10:00:00.000Z"),
        categoryName: null,
        categorySlug: null,
        tags: [],
      },
    ]);

    const home = await loadPortfolioHome("zh");

    expect(listArticlesForRole).toHaveBeenCalledWith("visitor");
    expect(home.journalPreview.map((article) => article.status)).toEqual([
      "public",
    ]);
  });
});
