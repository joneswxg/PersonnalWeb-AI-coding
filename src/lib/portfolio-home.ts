import type { ArticleCardData } from "@/lib/article-queries";
import type { PortfolioProfilePresentation } from "@/lib/portfolio-profile";
import type { PublicProjectDirectoryResult } from "@/lib/portfolio-project-directory";

type BuildPortfolioHomeInput = {
  portfolio: PortfolioProfilePresentation;
  directory: PublicProjectDirectoryResult;
  visibleArticles: ArticleCardData[];
};

export type PortfolioHome = {
  portfolio: PortfolioProfilePresentation;
  featuredProjects: PublicProjectDirectoryResult["projects"];
  projectDirectoryStatus: PublicProjectDirectoryResult["directoryStatus"];
  activity: PublicProjectDirectoryResult["activity"];
  journalPreview: ArticleCardData[];
};

const repositoryKey = (name: string) => name.toLocaleLowerCase("en-US");

export function buildPortfolioHome({
  portfolio,
  directory,
  visibleArticles,
}: BuildPortfolioHomeInput): PortfolioHome {
  const configuredProjects = portfolio.featuredProjects;
  if (
    configuredProjects.length !== 3 ||
    new Set(configuredProjects.map(repositoryKey)).size !== 3
  ) {
    throw new Error("Portfolio Home must configure exactly three Featured Projects.");
  }

  const featuredProjects =
    directory.directoryStatus === "unavailable"
      ? []
      : configuredProjects.map((name) => {
          const project = directory.projects.find(
            (candidate) => repositoryKey(candidate.name) === repositoryKey(name),
          );
          if (!project) {
            throw new Error(`Configured Featured Project is not eligible: ${name}.`);
          }
          return project;
        });

  return {
    portfolio,
    featuredProjects,
    projectDirectoryStatus: directory.directoryStatus,
    activity: directory.activity,
    journalPreview: visibleArticles.slice(0, 3),
  };
}
