import {
  collectActivitySnapshot,
  resolveActivitySnapshot,
  type ActivitySnapshotResult,
  type ActivitySnapshotStore,
  type GitHubActivitySource,
} from "@/lib/github-activity";
import {
  buildPublicProjectDirectory,
  type GitHubProjectSource,
  type ProjectOverview,
  type ProjectRules,
} from "@/lib/github-projects";

export type GitHubPortfolioSource = GitHubProjectSource & GitHubActivitySource;

export type PublicProjectDirectoryResult = {
  directoryStatus: "available" | "unavailable";
  projects: ProjectOverview[];
  activity: ActivitySnapshotResult;
};

type ResolvePublicProjectDirectoryInput = {
  githubIdentity: string;
  source: GitHubPortfolioSource;
  projectRules: ProjectRules;
  store: ActivitySnapshotStore;
  now: Date;
};

export async function resolvePublicProjectDirectory({
  githubIdentity,
  source,
  projectRules,
  store,
  now,
}: ResolvePublicProjectDirectoryInput): Promise<PublicProjectDirectoryResult> {
  let projects: ProjectOverview[];
  try {
    projects = await buildPublicProjectDirectory({ source, projectRules });
  } catch (refreshError) {
    const activity = await resolveActivitySnapshot({
      githubIdentity,
      store,
      now,
      refresh: () => Promise.reject(refreshError),
    });
    return { directoryStatus: "unavailable", projects: [], activity };
  }

  const activity = await resolveActivitySnapshot({
    githubIdentity,
    store,
    now,
    refresh: () =>
      collectActivitySnapshot({
        githubIdentity,
        projects,
        source,
        now,
      }),
  });

  return { directoryStatus: "available", projects, activity };
}
