import "server-only";

import {
  buildPublicProjectDirectory,
  type GitHubRepository,
} from "@/lib/github-projects";
import {
  resolveActivitySnapshot,
  type GitHubCommit,
} from "@/lib/github-activity";
import { databaseActivitySnapshotStore } from "@/lib/activity-snapshot-store";
import { loadPortfolioProfilePresentation } from "@/lib/portfolio-profile-source";
import type { PortfolioLocale } from "@/lib/portfolio-profile";
import {
  resolvePublicProjectDirectory,
  type GitHubPortfolioSource,
} from "@/lib/portfolio-project-directory";

const githubApiUrl = "https://api.github.com";

type GitHubApiRepository = {
  name: string;
  full_name: string;
  html_url: string;
  private: boolean;
  archived: boolean;
  fork: boolean;
  description: string | null;
  topics?: string[];
  updated_at?: string;
  stargazers_count?: number;
  forks_count?: number;
};

type GitHubApiCommit = {
  author: { login: string } | null;
  commit: {
    author: { date: string | null } | null;
  };
};

class GitHubRequestError extends Error {
  constructor(readonly status: number) {
    super(`GitHub request failed with status ${status}.`);
  }
}

function githubUsernameFromProfileUrl(profileUrl: string): string {
  const username = new URL(profileUrl).pathname.split("/").filter(Boolean)[0];
  if (!username) {
    throw new Error("Portfolio Profile GitHub URL must identify a GitHub user.");
  }
  return username;
}

function githubToken(): string {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    throw new Error("GITHUB_TOKEN is not set.");
  }
  return token;
}

async function githubRequest<T>(path: string, token: string): Promise<T> {
  const response = await fetch(`${githubApiUrl}${path}`, {
    cache: "no-store",
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });

  if (!response.ok) {
    throw new GitHubRequestError(response.status);
  }

  return response.json() as Promise<T>;
}

function mapRepository(repository: GitHubApiRepository): GitHubRepository {
  return {
    name: repository.name,
    fullName: repository.full_name,
    githubUrl: repository.html_url,
    isPrivate: repository.private,
    isArchived: repository.archived,
    isFork: repository.fork,
    ...(repository.description === null
      ? {}
      : { summary: repository.description }),
    ...(repository.topics === undefined ? {} : { topics: repository.topics }),
    ...(repository.updated_at === undefined
      ? {}
      : { updatedAt: repository.updated_at }),
    ...(repository.stargazers_count === undefined
      ? {}
      : { stars: repository.stargazers_count }),
    ...(repository.forks_count === undefined
      ? {}
      : { forks: repository.forks_count }),
  };
}

function createGitHubProjectSource(
  username: string,
  token: string,
): GitHubPortfolioSource {
  return {
    async listRepositories() {
      const repositories: GitHubRepository[] = [];
      for (let page = 1; ; page += 1) {
        const response = await githubRequest<GitHubApiRepository[]>(
          `/users/${encodeURIComponent(username)}/repos?type=owner&sort=updated&per_page=100&page=${page}`,
          token,
        );
        repositories.push(...response.map(mapRepository));
        if (response.length < 100) {
          return repositories;
        }
      }
    },
    listLanguages(repositoryName) {
      return githubRequest<Record<string, number>>(
        `/repos/${encodeURIComponent(username)}/${encodeURIComponent(repositoryName)}/languages`,
        token,
      );
    },
    async listCommits(repositoryName, githubIdentity) {
      let response: GitHubApiCommit[];
      try {
        response = await githubRequest<GitHubApiCommit[]>(
          `/repos/${encodeURIComponent(username)}/${encodeURIComponent(repositoryName)}/commits?author=${encodeURIComponent(githubIdentity)}&per_page=1`,
          token,
        );
      } catch (error) {
        if (error instanceof GitHubRequestError && error.status === 409) {
          return [];
        }
        throw error;
      }

      return response.flatMap((commit): GitHubCommit[] => {
        const authoredAt = commit.commit.author?.date;
        return authoredAt
          ? [
              {
                ...(commit.author ? { authorLogin: commit.author.login } : {}),
                authoredAt,
              },
            ]
          : [];
      });
    },
  };
}

export async function loadPublicProjectDirectory(
  locale: PortfolioLocale = "zh",
) {
  const profile = await loadPortfolioProfilePresentation(locale);
  const username = githubUsernameFromProfileUrl(profile.profile.githubUrl);

  return buildPublicProjectDirectory({
    source: createGitHubProjectSource(username, githubToken()),
    projectRules: profile.projectRules,
  });
}

export async function loadPublicProjectDirectoryWithActivity(
  locale: PortfolioLocale = "zh",
  now = new Date(),
) {
  const profile = await loadPortfolioProfilePresentation(locale);
  const githubIdentity = githubUsernameFromProfileUrl(profile.profile.githubUrl);
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    const activity = await resolveActivitySnapshot({
      githubIdentity,
      store: databaseActivitySnapshotStore,
      now,
      refresh: () => Promise.reject(new Error("GITHUB_TOKEN is not set.")),
    });
    return { directoryStatus: "unavailable" as const, projects: [], activity };
  }

  const source = createGitHubProjectSource(githubIdentity, token);
  return resolvePublicProjectDirectory({
    githubIdentity,
    source,
    projectRules: profile.projectRules,
    store: databaseActivitySnapshotStore,
    now,
  });
}
