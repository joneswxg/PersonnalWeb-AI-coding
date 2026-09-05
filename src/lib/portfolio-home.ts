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

function configuredProjectLinks(
  portfolio: PortfolioProfilePresentation,
): PublicProjectDirectoryResult["projects"] {
  const githubProfileUrl = portfolio.profile.githubUrl.replace(/\/$/, "");
  const admittedForks = new Map(
    portfolio.projectRules.admittedForks.map((fork) => [
      repositoryKey(fork.repository),
      fork,
    ]),
  );

  return portfolio.featuredProjects.map((project) => {
    const admittedFork = admittedForks.get(repositoryKey(project.repository));
    return {
      name: project.repository,
      fullName: `${new URL(githubProfileUrl).pathname.split("/").filter(Boolean)[0]}/${project.repository}`,
      githubUrl: `${githubProfileUrl}/${encodeURIComponent(project.repository)}`,
      summary: project.summary,
      technologies: project.technologies,
      topics: [],
      ...(admittedFork
        ? {
            attribution: {
              upstream: admittedFork.upstream,
              summary: admittedFork.attribution,
            },
          }
        : {}),
    };
  });
}

export function buildPortfolioHome({
  portfolio,
  directory,
  visibleArticles,
}: BuildPortfolioHomeInput): PortfolioHome {
  const configuredProjects = portfolio.featuredProjects;
  if (
    configuredProjects.length !== 3 ||
    new Set(
      configuredProjects.map((project) => repositoryKey(project.repository)),
    ).size !== 3
  ) {
    throw new Error("Portfolio Home must configure exactly three Featured Projects.");
  }

  const featuredProjects =
    directory.directoryStatus === "unavailable"
      ? configuredProjectLinks(portfolio)
      : configuredProjects.map((configuredProject) => {
          const project = directory.projects.find(
            (candidate) =>
              repositoryKey(candidate.name) ===
              repositoryKey(configuredProject.repository),
          );
          if (!project) {
            throw new Error(
              `Configured Featured Project is not eligible: ${configuredProject.repository}.`,
            );
          }
          return {
            ...project,
            summary: configuredProject.summary,
            technologies: configuredProject.technologies,
          };
        });

  return {
    portfolio,
    featuredProjects,
    projectDirectoryStatus: directory.directoryStatus,
    activity: directory.activity,
    journalPreview: visibleArticles.slice(0, 3),
  };
}
