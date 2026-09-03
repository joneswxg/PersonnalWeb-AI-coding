import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink, GitFork, Star } from "lucide-react";
import { loadPublicProjectDirectory } from "@/lib/github-projects-source";
import type { PortfolioLocale } from "@/lib/portfolio-profile";
import type { ProjectOverview } from "@/lib/github-projects";

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
    noSummary: "此仓库暂未提供项目简介。",
    technologies: "主要技术",
    topics: "主题",
    updated: "更新于",
    github: "在 GitHub 查看",
    attribution: "项目归属说明",
    upstream: "上游项目",
  },
  en: {
    eyebrow: "Public Project Directory",
    title: "Engineering projects and practice",
    introduction:
      "Eligible GitHub work appears here from repository data, filtered by the editorial rules maintained with the portfolio profile.",
    empty: "No projects currently meet the public portfolio rules.",
    noSummary: "This repository does not provide a project summary yet.",
    technologies: "Principal technologies",
    topics: "Topics",
    updated: "Updated",
    github: "View on GitHub",
    attribution: "Project attribution",
    upstream: "Upstream",
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
  const projects = await loadPublicProjectDirectory(locale);
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

        {projects.length === 0 ? (
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
