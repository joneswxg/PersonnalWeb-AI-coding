export type GitHubRepository = {
  name: string;
  fullName: string;
  githubUrl: string;
  isPrivate: boolean;
  isArchived: boolean;
  isFork: boolean;
  summary?: string;
  topics?: string[];
  updatedAt?: string;
  stars?: number;
  forks?: number;
};

export type GitHubProjectSource = {
  listRepositories(): Promise<GitHubRepository[]>;
  listLanguages(repositoryName: string): Promise<Record<string, number>>;
};

export type ProjectRules = {
  excludedRepositories: string[];
  admittedForks: Array<{
    repository: string;
    upstream: string;
    attribution: string;
  }>;
};

export type ProjectOverview = {
  name: string;
  fullName: string;
  githubUrl: string;
  summary?: string;
  technologies: string[];
  topics: string[];
  updatedAt?: string;
  stars?: number;
  forks?: number;
  attribution?: {
    upstream: string;
    summary: string;
  };
};

type BuildPublicProjectDirectoryInput = {
  source: GitHubProjectSource;
  projectRules: ProjectRules;
};

const repositoryKey = (name: string) => name.toLocaleLowerCase("en-US");

export async function buildPublicProjectDirectory({
  source,
  projectRules,
}: BuildPublicProjectDirectoryInput): Promise<ProjectOverview[]> {
  const excludedRepositories = new Set(
    projectRules.excludedRepositories.map(repositoryKey),
  );
  const admittedForks = new Map(
    projectRules.admittedForks.map((fork) => [repositoryKey(fork.repository), fork]),
  );
  const repositories = await source.listRepositories();
  const eligibleRepositories = repositories.filter((repository) => {
      const key = repositoryKey(repository.name);
      return (
        !repository.isPrivate &&
        !repository.isArchived &&
        !excludedRepositories.has(key) &&
        (!repository.isFork || admittedForks.has(key))
      );
    });

  const projects = await Promise.all(
    eligibleRepositories.map(async (repository): Promise<ProjectOverview> => {
      const admittedFork = admittedForks.get(repositoryKey(repository.name));
      const languages = await source.listLanguages(repository.name);
      return {
        name: repository.name,
        fullName: repository.fullName,
        githubUrl: repository.githubUrl,
        ...(repository.summary === undefined
          ? {}
          : { summary: repository.summary }),
        technologies: Object.entries(languages)
          .sort(([, leftBytes], [, rightBytes]) => rightBytes - leftBytes)
          .slice(0, 5)
          .map(([language]) => language),
        topics: repository.topics ?? [],
        ...(repository.updatedAt === undefined
          ? {}
          : { updatedAt: repository.updatedAt }),
        ...(repository.stars === undefined ? {} : { stars: repository.stars }),
        ...(repository.forks === undefined ? {} : { forks: repository.forks }),
        ...(admittedFork
          ? { attribution: {
              upstream: admittedFork.upstream,
              summary: admittedFork.attribution,
            } }
          : {}),
      };
    }),
  );

  return projects.sort((left, right) => left.name.localeCompare(right.name));
}
