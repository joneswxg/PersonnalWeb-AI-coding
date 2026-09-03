import type { ProjectOverview } from "@/lib/github-projects";

export const activitySnapshotSchemaVersion = 1 as const;
export const activityTimeZone = "Asia/Shanghai" as const;
export const activityWindowDurationDays = 30;
export const activitySnapshotFreshnessHours = 24;

const dayMilliseconds = 24 * 60 * 60 * 1_000;
const shanghaiUtcOffsetMilliseconds = 8 * 60 * 60 * 1_000;

export type GitHubCommit = {
  authorLogin?: string;
  authoredAt: string;
};

export type GitHubActivitySource = {
  listCommits(
    repositoryName: string,
    githubIdentity: string,
  ): Promise<GitHubCommit[]>;
};

export type PortfolioMetrics = {
  eligibleProjectCount: number;
  activeProjectCount: number;
  mostRecentOwnerCommitAt?: string;
  primaryLanguageDistribution: Array<{
    language: string;
    projectCount: number;
  }>;
};

export type ActivitySnapshot = {
  schemaVersion: typeof activitySnapshotSchemaVersion;
  githubIdentity: string;
  collectedAt: string;
  source: "GitHub REST API";
  window: {
    timeZone: typeof activityTimeZone;
    durationDays: typeof activityWindowDurationDays;
    startsAt: string;
    endsAt: string;
  };
  metrics: PortfolioMetrics;
};

export type ActivitySnapshotStore = {
  load(githubIdentity: string): Promise<ActivitySnapshot | null>;
  save(snapshot: ActivitySnapshot): Promise<void>;
};

export type ActivitySnapshotResult =
  | { status: "fresh-cache" | "refreshed" | "stale-fallback"; snapshot: ActivitySnapshot }
  | { status: "unavailable"; snapshot: null };

type CollectActivitySnapshotInput = {
  githubIdentity: string;
  projects: ProjectOverview[];
  source: GitHubActivitySource;
  now: Date;
};

function activityWindowStart(now: Date): Date {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: activityTimeZone,
    year: "numeric",
    month: "numeric",
    day: "numeric",
  }).formatToParts(now);
  const value = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((part) => part.type === type)?.value);
  const currentShanghaiDateAtUtc = Date.UTC(
    value("year"),
    value("month") - 1,
    value("day"),
  );

  return new Date(
    currentShanghaiDateAtUtc -
      (activityWindowDurationDays - 1) * dayMilliseconds -
      shanghaiUtcOffsetMilliseconds,
  );
}

function primaryLanguageDistribution(projects: ProjectOverview[]) {
  const counts = new Map<string, number>();
  for (const project of projects) {
    const primaryLanguage = project.technologies[0];
    if (primaryLanguage) {
      counts.set(primaryLanguage, (counts.get(primaryLanguage) ?? 0) + 1);
    }
  }

  return [...counts.entries()]
    .map(([language, projectCount]) => ({ language, projectCount }))
    .sort(
      (left, right) =>
        right.projectCount - left.projectCount ||
        left.language.localeCompare(right.language),
    );
}

export async function collectActivitySnapshot({
  githubIdentity,
  projects,
  source,
  now,
}: CollectActivitySnapshotInput): Promise<ActivitySnapshot> {
  const startsAt = activityWindowStart(now);
  const commitsByProject = await Promise.all(
    projects.map(async (project) => ({
      project,
      commits: await source.listCommits(project.name, githubIdentity),
    })),
  );
  let activeProjectCount = 0;
  let mostRecentOwnerCommit: Date | undefined;
  const identity = githubIdentity.toLocaleLowerCase("en-US");

  for (const { commits } of commitsByProject) {
    let projectIsActive = false;
    for (const commit of commits) {
      if (commit.authorLogin?.toLocaleLowerCase("en-US") !== identity) {
        continue;
      }
      const authoredAt = new Date(commit.authoredAt);
      if (Number.isNaN(authoredAt.getTime()) || authoredAt > now) {
        continue;
      }
      if (!mostRecentOwnerCommit || authoredAt > mostRecentOwnerCommit) {
        mostRecentOwnerCommit = authoredAt;
      }
      if (authoredAt >= startsAt) {
        projectIsActive = true;
      }
    }
    if (projectIsActive) {
      activeProjectCount += 1;
    }
  }

  return {
    schemaVersion: activitySnapshotSchemaVersion,
    githubIdentity,
    collectedAt: now.toISOString(),
    source: "GitHub REST API",
    window: {
      timeZone: activityTimeZone,
      durationDays: activityWindowDurationDays,
      startsAt: startsAt.toISOString(),
      endsAt: now.toISOString(),
    },
    metrics: {
      eligibleProjectCount: projects.length,
      activeProjectCount,
      ...(mostRecentOwnerCommit
        ? { mostRecentOwnerCommitAt: mostRecentOwnerCommit.toISOString() }
        : {}),
      primaryLanguageDistribution: primaryLanguageDistribution(projects),
    },
  };
}

type ResolveActivitySnapshotInput = {
  githubIdentity: string;
  store: ActivitySnapshotStore;
  refresh(): Promise<ActivitySnapshot>;
  now: Date;
};

export async function resolveActivitySnapshot({
  githubIdentity,
  store,
  refresh,
  now,
}: ResolveActivitySnapshotInput): Promise<ActivitySnapshotResult> {
  const existing = await store.load(githubIdentity);
  const freshnessMilliseconds = activitySnapshotFreshnessHours * 60 * 60 * 1_000;
  const snapshotAge = existing
    ? now.getTime() - new Date(existing.collectedAt).getTime()
    : undefined;
  if (
    existing &&
    snapshotAge !== undefined &&
    snapshotAge >= 0 &&
    snapshotAge < freshnessMilliseconds
  ) {
    return { status: "fresh-cache", snapshot: existing };
  }

  try {
    const snapshot = await refresh();
    await store.save(snapshot);
    return { status: "refreshed", snapshot };
  } catch {
    if (existing) {
      return { status: "stale-fallback", snapshot: existing };
    }
    return { status: "unavailable", snapshot: null };
  }
}
