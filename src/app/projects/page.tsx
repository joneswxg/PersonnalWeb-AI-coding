import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink, GitFork, Star } from "lucide-react";
import { loadPublicProjectDirectoryWithActivity } from "@/lib/github-projects-source";
import type { PortfolioLocale } from "@/lib/portfolio-profile";
import type { ProjectOverview } from "@/lib/github-projects";
import type { ActivitySnapshotResult } from "@/lib/github-activity";
import { GitHubRefreshButton } from "@/components/github-refresh-button";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Projects | joneswxg",
  description: "Public engineering projects from the joneswxg GitHub identity.",
};

type ProjectsPageProps = {
  searchParams: Promise<{ lang?: string | string[] }>;
};

const labels = {
  zh: {
    eyebrow: "公开项目目录",
    title: "工程项目与实践",
    introduction:
      "这里收录符合公开作品规则的 GitHub 项目，项目信息直接来自仓库，并由版本控制的作品集规则进行筛选。",
    empty: "目前没有符合公开作品规则的项目。",
    directoryUnavailable: "GitHub 项目目录暂时无法刷新，请稍后重试。",
    retryGitHub: "重新获取 GitHub 数据",
    noSummary: "此仓库暂未提供项目简介。",
    technologies: "主要技术",
    topics: "主题",
    updated: "更新于",
    github: "在 GitHub 查看",
    attribution: "项目归属说明",
    upstream: "上游项目",
    activityTitle: "GitHub 活动快照",
    activityIntroduction: "仅统计由 GitHub 身份 joneswxg 创作的提交。",
    eligibleProjects: "符合规则的项目",
    activeProjects: "30 天内有本人提交的项目",
    latestCommit: "最近一次本人提交",
    languages: "主要语言分布",
    noCommit: "暂无本人提交记录",
    noLanguages: "暂无语言数据",
    source: "数据源",
    window: "统计窗口",
    collected: "采集时间",
    retainedSnapshot: "GitHub 刷新失败，当前展示最近一次成功保存的活动快照。",
    unavailable: "GitHub 活动暂不可用，且尚无已保存的活动快照。",
  },
  en: {
    eyebrow: "Public Project Directory",
    title: "Engineering projects and practice",
    introduction:
      "Eligible GitHub work appears here from repository data, filtered by the editorial rules maintained with the portfolio profile.",
    empty: "No projects currently meet the public portfolio rules.",
    directoryUnavailable: "The GitHub project directory cannot be refreshed right now.",
    retryGitHub: "Retry GitHub data",
    noSummary: "This repository does not provide a project summary yet.",
    technologies: "Principal technologies",
    topics: "Topics",
    updated: "Updated",
    github: "View on GitHub",
    attribution: "Project attribution",
    upstream: "Upstream",
    activityTitle: "GitHub Activity Snapshot",
    activityIntroduction: "Counts only commits authored by the joneswxg GitHub identity.",
    eligibleProjects: "Eligible projects",
    activeProjects: "Projects with owner commits in 30 days",
    latestCommit: "Most recent owner commit",
    languages: "Primary-language distribution",
    noCommit: "No owner-authored commit found",
    noLanguages: "No language data available",
    source: "Source",
    window: "Activity Window",
    collected: "Collected",
    retainedSnapshot: "GitHub refresh failed. Showing the latest successful Activity Snapshot.",
    unavailable: "GitHub activity is unavailable and no stored snapshot exists yet.",
  },
} as const;

function formatUpdateTime(value: string, locale: PortfolioLocale): string | undefined {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return undefined;
  }
  return new Intl.DateTimeFormat(locale === "zh" ? "zh-CN" : "en", {
    dateStyle: "medium",
  }).format(date);
}

function formatActivityTime(value: string, locale: PortfolioLocale): string {
  return new Intl.DateTimeFormat(locale === "zh" ? "zh-CN" : "en", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Shanghai",
  }).format(new Date(value));
}

function ActivityDashboard({
  result,
  locale,
}: {
  result: ActivitySnapshotResult;
  locale: PortfolioLocale;
}) {
  const copy = labels[locale];

  if (!result.snapshot) {
    return (
      <section className="mb-14 rounded-3xl border border-dashed border-stone-300 bg-white p-6 sm:p-8">
        <h2 className="text-2xl font-semibold tracking-tight text-stone-950">
          {copy.activityTitle}
        </h2>
        <p className="mt-4 text-stone-500">{copy.unavailable}</p>
      </section>
    );
  }

  const { snapshot } = result;
  const metrics = snapshot.metrics;
  const windowLabel = `${formatActivityTime(snapshot.window.startsAt, locale)} — ${formatActivityTime(snapshot.window.endsAt, locale)}`;

  return (
    <section className="mb-14 rounded-3xl bg-stone-950 p-6 text-white sm:p-8 lg:p-10">
      <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-start">
        <div className="max-w-2xl">
          <p className="text-xs font-medium tracking-[0.18em] text-amber-300 uppercase">
            {copy.activityTitle}
          </p>
          <h2 className="mt-4 text-2xl font-semibold tracking-tight sm:text-3xl">
            {copy.activityIntroduction}
          </h2>
        </div>
        <dl className="space-y-2 text-xs leading-5 text-stone-300">
          <div>
            <dt className="inline font-semibold text-white">{copy.source}: </dt>
            <dd className="inline">{snapshot.source} · @{snapshot.githubIdentity}</dd>
          </div>
          <div>
            <dt className="inline font-semibold text-white">{copy.window}: </dt>
            <dd className="inline">
              {windowLabel} ({snapshot.window.timeZone}, {snapshot.window.durationDays} days)
            </dd>
          </div>
          <div>
            <dt className="inline font-semibold text-white">{copy.collected}: </dt>
            <dd className="inline">{formatActivityTime(snapshot.collectedAt, locale)}</dd>
          </div>
        </dl>
      </div>

      {result.status === "retained-snapshot" && (
        <p className="mt-6 rounded-2xl bg-amber-300/10 px-4 py-3 text-sm text-amber-100">
          {copy.retainedSnapshot}
        </p>
      )}

      <dl className="mt-8 grid gap-px overflow-hidden rounded-2xl bg-white/10 sm:grid-cols-3">
        <div className="bg-stone-900 p-5">
          <dt className="text-sm text-stone-400">{copy.eligibleProjects}</dt>
          <dd className="mt-2 text-3xl font-semibold">{metrics.eligibleProjectCount}</dd>
        </div>
        <div className="bg-stone-900 p-5">
          <dt className="text-sm text-stone-400">{copy.activeProjects}</dt>
          <dd className="mt-2 text-3xl font-semibold">{metrics.activeProjectCount}</dd>
        </div>
        <div className="bg-stone-900 p-5">
          <dt className="text-sm text-stone-400">{copy.latestCommit}</dt>
          <dd className="mt-2 text-base font-semibold">
            {metrics.mostRecentOwnerCommitAt
              ? formatActivityTime(metrics.mostRecentOwnerCommitAt, locale)
              : copy.noCommit}
          </dd>
        </div>
      </dl>

      <div className="mt-8">
        <h3 className="text-sm font-semibold text-stone-200">{copy.languages}</h3>
        {metrics.primaryLanguageDistribution.length === 0 ? (
          <p className="mt-3 text-sm text-stone-400">{copy.noLanguages}</p>
        ) : (
          <div className="mt-4 flex flex-wrap gap-3">
            {metrics.primaryLanguageDistribution.map((item) => (
              <span
                key={item.language}
                className="rounded-full bg-white/10 px-3 py-1.5 text-sm text-stone-100"
              >
                {item.language} · {item.projectCount}
              </span>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function ProjectCard({
  project,
  locale,
}: {
  project: ProjectOverview;
  locale: PortfolioLocale;
}) {
  const copy = labels[locale];
  const updateTime = project.updatedAt
    ? formatUpdateTime(project.updatedAt, locale)
    : undefined;

  return (
    <article className="flex h-full flex-col rounded-3xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium tracking-[0.16em] text-amber-700 uppercase">
            {project.fullName}
          </p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-stone-950">
            {project.name}
          </h2>
        </div>
        <a
          href={project.githubUrl}
          aria-label={`${copy.github}: ${project.name}`}
          className="rounded-full border border-stone-200 p-2 text-stone-500 transition hover:border-stone-400 hover:text-stone-950"
        >
          <ExternalLink className="size-4" aria-hidden="true" />
        </a>
      </div>

      <p className="mt-5 leading-7 text-stone-600">
        {project.summary ?? copy.noSummary}
      </p>

      {project.technologies.length > 0 && (
        <div className="mt-6">
          <h3 className="text-xs font-semibold tracking-[0.14em] text-stone-500 uppercase">
            {copy.technologies}
          </h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {project.technologies.map((technology) => (
              <span
                key={technology}
                className="rounded-full bg-stone-950 px-3 py-1 text-xs font-medium text-white"
              >
                {technology}
              </span>
            ))}
          </div>
        </div>
      )}

      {project.topics.length > 0 && (
        <div className="mt-5">
          <h3 className="text-xs font-semibold tracking-[0.14em] text-stone-500 uppercase">
            {copy.topics}
          </h3>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm text-amber-800">
            {project.topics.map((topic) => (
              <span key={topic}>#{topic}</span>
            ))}
          </div>
        </div>
      )}

      {project.attribution && (
        <aside className="mt-6 rounded-2xl bg-amber-50 p-4 text-sm leading-6 text-stone-700">
          <p className="font-semibold text-stone-900">{copy.attribution}</p>
          <p className="mt-1">
            {copy.upstream}: {project.attribution.upstream}
          </p>
          <p className="mt-1">{project.attribution.summary}</p>
        </aside>
      )}

      <footer className="mt-auto flex flex-wrap items-center gap-x-5 gap-y-3 border-t border-stone-100 pt-6 text-sm text-stone-500">
        {project.stars !== undefined && (
          <span className="inline-flex items-center gap-1.5">
            <Star className="size-4" aria-hidden="true" />
            {project.stars}
          </span>
        )}
        {project.forks !== undefined && (
          <span className="inline-flex items-center gap-1.5">
            <GitFork className="size-4" aria-hidden="true" />
            {project.forks}
          </span>
        )}
        {updateTime && (
          <span>
            {copy.updated} {updateTime}
          </span>
        )}
        <a
          href={project.githubUrl}
          className="ml-auto font-medium text-stone-800 underline decoration-stone-300 underline-offset-4 hover:decoration-stone-700"
        >
          {copy.github}
        </a>
      </footer>
    </article>
  );
}

export default async function ProjectsPage({ searchParams }: ProjectsPageProps) {
  const parameters = await searchParams;
  const locale: PortfolioLocale = parameters.lang === "en" ? "en" : "zh";
  const { directoryStatus, projects, activity } =
    await loadPublicProjectDirectoryWithActivity(locale);
  const copy = labels[locale];

  return (
    <div lang={locale === "zh" ? "zh-CN" : "en"} className="min-h-full bg-stone-50">
      <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-16">
        <div className="flex justify-end text-sm" aria-label="Language">
          <Link
            href="/projects"
            aria-current={locale === "zh" ? "page" : undefined}
            className={locale === "zh" ? "font-semibold text-stone-950" : "text-stone-500"}
          >
            中文
          </Link>
          <span className="mx-3 text-stone-300">/</span>
          <Link
            href="/projects?lang=en"
            aria-current={locale === "en" ? "page" : undefined}
            className={locale === "en" ? "font-semibold text-stone-950" : "text-stone-500"}
          >
            English
          </Link>
        </div>

        <header className="max-w-3xl py-14 sm:py-20">
          <p className="text-sm font-medium tracking-[0.2em] text-amber-700 uppercase">
            {copy.eyebrow}
          </p>
          <h1 className="mt-5 text-4xl font-semibold tracking-tight text-stone-950 sm:text-6xl">
            {copy.title}
          </h1>
          <p className="mt-6 text-base leading-8 text-stone-600 sm:text-lg">
            {copy.introduction}
          </p>
        </header>

        <ActivityDashboard result={activity} locale={locale} />

        {directoryStatus === "unavailable" ? (
          <div className="flex flex-col items-center gap-4 rounded-3xl border border-dashed border-stone-300 bg-white px-6 py-14 text-center text-stone-500">
            <p>{copy.directoryUnavailable}</p>
            <GitHubRefreshButton locale={locale} label={copy.retryGitHub} />
          </div>
        ) : projects.length === 0 ? (
          <p className="rounded-3xl border border-dashed border-stone-300 bg-white px-6 py-16 text-center text-stone-500">
            {copy.empty}
          </p>
        ) : (
          <section
            aria-label={copy.eyebrow}
            className="grid gap-6 lg:grid-cols-2"
          >
            {projects.map((project) => (
              <ProjectCard key={project.fullName} project={project} locale={locale} />
            ))}
          </section>
        )}
      </div>
    </div>
  );
}
