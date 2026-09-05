import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ExternalLink, GitFork, Star } from "lucide-react";
import { loadPortfolioHome } from "@/lib/portfolio-home-source";
import type { PortfolioLocale } from "@/lib/portfolio-profile";
import type { ProjectOverview } from "@/lib/github-projects";
import type { ActivitySnapshotResult } from "@/lib/github-activity";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Portfolio",
  description:
    "A recruiter-first profile with selected engineering projects, verified GitHub activity, and technical writing.",
};

type HomePageProps = {
  searchParams: Promise<{ lang?: string | string[] }>;
};

const labels = {
  zh: {
    profile: "个人作品集",
    skills: "核心技能",
    experience: "职业经历",
    clientProjects: "项目经验",
    projectScale: "项目规模",
    education: "教育背景",
    certifications: "专业认证",
    empty: "内容尚未提供",
    github: "查看 GitHub",
    journal: "阅读技术文章",
    credential: "查看凭证",
    featured: "精选项目",
    featuredIntroduction: "具有代表性的工程实践与可核验成果。",
    allProjects: "浏览全部公开项目",
    noSummary: "此仓库暂未提供项目简介。",
    attribution: "项目归属说明",
    upstream: "上游项目",
    activity: "GitHub 活动",
    activityIntroduction: "只统计由 joneswxg 创作并可归属的公开提交。",
    eligibleProjects: "符合规则的项目",
    activeProjects: "30 天内活跃项目",
    latestCommit: "最近本人提交",
    noCommit: "暂无记录",
    activityUnavailable: "尚无可用的活动快照。",
    retainedSnapshot: "GitHub 刷新失败，展示最近一次成功保存的活动快照。",
    source: "数据源",
    window: "统计窗口",
    collected: "采集时间",
    journalPreview: "技术日志",
    journalIntroduction: "关于工程决策、实现细节与持续学习的深入记录。",
    allArticles: "查看全部技术文章",
    noArticles: "暂无可见的技术文章。",
    updated: "更新于",
  },
  en: {
    profile: "Personal Portfolio",
    skills: "Core skills",
    experience: "Career experience",
    clientProjects: "Client project experience",
    projectScale: "Project scale",
    education: "Educational background",
    certifications: "Professional certifications",
    empty: "Content not supplied yet",
    github: "View GitHub",
    journal: "Read the Technical Journal",
    credential: "View credential",
    featured: "Featured Projects",
    featuredIntroduction: "Selected engineering work with verifiable outcomes.",
    allProjects: "Browse all public projects",
    noSummary: "This repository does not provide a project summary yet.",
    attribution: "Project attribution",
    upstream: "Upstream",
    activity: "GitHub Activity",
    activityIntroduction: "Counts only attributable public commits authored by joneswxg.",
    eligibleProjects: "Eligible projects",
    activeProjects: "Active projects in 30 days",
    latestCommit: "Most recent owner commit",
    noCommit: "No record yet",
    activityUnavailable: "No Activity Snapshot is available yet.",
    retainedSnapshot: "GitHub refresh failed. Showing the latest successful Activity Snapshot.",
    source: "Source",
    window: "Activity Window",
    collected: "Collected",
    journalPreview: "Technical Journal",
    journalIntroduction: "Detailed notes on engineering decisions, implementation, and learning.",
    allArticles: "View all technical articles",
    noArticles: "No visible Technical Journal articles yet.",
    updated: "Updated",
  },
} as const;

function formatDate(value: string | Date, locale: PortfolioLocale) {
  return new Intl.DateTimeFormat(locale === "zh" ? "zh-CN" : "en", {
    dateStyle: "medium",
    timeZone: "Asia/Shanghai",
  }).format(new Date(value));
}

function localizedRoute(path: string, locale: PortfolioLocale) {
  return locale === "en" ? `${path}?lang=en` : path;
}

function PortfolioProfileSection({
  title,
  emptyLabel,
  children,
  isEmpty,
}: {
  title: string;
  emptyLabel: string;
  children: React.ReactNode;
  isEmpty: boolean;
}) {
  return (
    <section className="border-t border-stone-200 py-10 sm:py-14">
      <div className="grid gap-6 md:grid-cols-[12rem_1fr] md:gap-12">
        <h2 className="text-sm font-semibold tracking-[0.18em] text-stone-500 uppercase">
          {title}
        </h2>
        {isEmpty ? (
          <p className="text-sm text-stone-400">{emptyLabel}</p>
        ) : (
          <div>{children}</div>
        )}
      </div>
    </section>
  );
}

function FeaturedProjectOverview({
  project,
  locale,
}: {
  project: ProjectOverview;
  locale: PortfolioLocale;
}) {
  const copy = labels[locale];

  return (
    <article className="flex h-full flex-col rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <h3 className="text-xl font-semibold tracking-tight text-stone-950">
          {project.name}
        </h3>
        <a
          href={project.githubUrl}
          aria-label={`${copy.github}: ${project.name}`}
          className="rounded-full border border-stone-200 p-2 text-stone-500 transition hover:border-stone-400 hover:text-stone-950"
        >
          <ExternalLink className="size-4" aria-hidden="true" />
        </a>
      </div>
      <p className="mt-4 flex-1 text-sm leading-7 text-stone-600">
        {project.summary ?? copy.noSummary}
      </p>
      {project.technologies.length > 0 && (
        <div className="mt-5 flex flex-wrap gap-2">
          {project.technologies.slice(0, 3).map((technology) => (
            <span
              key={technology}
              className="rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-stone-700"
            >
              {technology}
            </span>
          ))}
        </div>
      )}
      {project.attribution && (
        <aside className="mt-5 rounded-2xl bg-amber-50 p-4 text-sm leading-6 text-stone-700">
          <p className="font-semibold text-stone-900">{copy.attribution}</p>
          <p className="mt-1">
            {copy.upstream}: {project.attribution.upstream}
          </p>
          <p className="mt-1">{project.attribution.summary}</p>
        </aside>
      )}
      <div className="mt-5 flex items-center gap-4 border-t border-stone-100 pt-4 text-xs text-stone-500">
        {project.stars !== undefined && (
          <span className="inline-flex items-center gap-1">
            <Star className="size-3.5" aria-hidden="true" /> {project.stars}
          </span>
        )}
        {project.forks !== undefined && (
          <span className="inline-flex items-center gap-1">
            <GitFork className="size-3.5" aria-hidden="true" /> {project.forks}
          </span>
        )}
        <a
          href={project.githubUrl}
          className="ml-auto font-medium text-stone-800 underline decoration-stone-300 underline-offset-4"
        >
          {copy.github}
        </a>
      </div>
    </article>
  );
}

function ActivitySummary({
  result,
  locale,
}: {
  result: ActivitySnapshotResult;
  locale: PortfolioLocale;
}) {
  const copy = labels[locale];
  if (!result.snapshot) {
    return (
      <section className="rounded-3xl bg-stone-950 p-7 text-white sm:p-10">
        <p className="text-sm font-semibold tracking-[0.18em] text-amber-300 uppercase">
          {copy.activity}
        </p>
        <p className="mt-5 text-stone-300">{copy.activityUnavailable}</p>
      </section>
    );
  }

  const { snapshot } = result;
  const metrics = snapshot.metrics;

  return (
    <section className="rounded-3xl bg-stone-950 p-7 text-white sm:p-10">
      <div className="flex flex-col justify-between gap-5 md:flex-row md:items-start">
        <div>
          <p className="text-sm font-semibold tracking-[0.18em] text-amber-300 uppercase">
            {copy.activity}
          </p>
          <h2 className="mt-4 max-w-xl text-2xl font-semibold tracking-tight sm:text-3xl">
            {copy.activityIntroduction}
          </h2>
        </div>
        <Link
          href={localizedRoute("/projects", locale)}
          className="inline-flex items-center gap-2 text-sm font-medium text-amber-200"
        >
          {copy.allProjects} <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
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
              ? formatDate(metrics.mostRecentOwnerCommitAt, locale)
              : copy.noCommit}
          </dd>
        </div>
      </dl>

      <dl className="mt-5 grid gap-2 text-xs leading-5 text-stone-400 md:grid-cols-3">
        <div>
          <dt className="inline font-semibold text-stone-200">{copy.source}: </dt>
          <dd className="inline">{snapshot.source} · @{snapshot.githubIdentity}</dd>
        </div>
        <div>
          <dt className="inline font-semibold text-stone-200">{copy.window}: </dt>
          <dd className="inline">
            {formatDate(snapshot.window.startsAt, locale)} — {formatDate(snapshot.window.endsAt, locale)} ({snapshot.window.timeZone})
          </dd>
        </div>
        <div>
          <dt className="inline font-semibold text-stone-200">{copy.collected}: </dt>
          <dd className="inline">{formatDate(snapshot.collectedAt, locale)}</dd>
        </div>
      </dl>
    </section>
  );
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const parameters = await searchParams;
  const locale: PortfolioLocale = parameters.lang === "en" ? "en" : "zh";
  const home = await loadPortfolioHome(locale);
  const { portfolio } = home;
  const copy = labels[locale];

  return (
    <div lang={locale === "zh" ? "zh-CN" : "en"} className="bg-stone-50">
      <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-12">
        <div className="mb-10 flex justify-end text-sm" aria-label="Language">
          <Link
            href="/"
            aria-current={locale === "zh" ? "page" : undefined}
            className={locale === "zh" ? "font-semibold text-stone-950" : "text-stone-500"}
          >
            中文
          </Link>
          <span className="mx-3 text-stone-300">/</span>
          <Link
            href="/?lang=en"
            aria-current={locale === "en" ? "page" : undefined}
            className={locale === "en" ? "font-semibold text-stone-950" : "text-stone-500"}
          >
            English
          </Link>
        </div>

        <header className="grid items-center gap-10 pb-14 md:grid-cols-[1fr_16rem] md:gap-16 md:pb-20">
          <div>
            <p className="mb-4 text-sm font-medium tracking-[0.2em] text-amber-700 uppercase">
              {copy.profile}
            </p>
            <h1 className="text-4xl font-semibold tracking-tight text-stone-950 sm:text-6xl">
              {portfolio.profile.name}
            </h1>
            <p className="mt-4 text-xl text-stone-700 sm:text-2xl">
              {portfolio.profile.title}
            </p>
            {(portfolio.profile.location || portfolio.profile.gender) && (
              <p className="mt-3 text-sm text-stone-500">
                {[portfolio.profile.location, portfolio.profile.gender]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            )}
            <p className="mt-6 max-w-2xl text-base leading-8 text-stone-600 sm:text-lg">
              {portfolio.profile.summary}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href={portfolio.profile.githubUrl}
                className="rounded-full bg-stone-950 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-stone-700"
              >
                {copy.github}
              </a>
              <Link
                href={localizedRoute("/journal", locale)}
                className="rounded-full border border-stone-300 bg-white px-5 py-2.5 text-sm font-medium text-stone-800 transition hover:border-stone-500"
              >
                {copy.journal}
              </Link>
            </div>
          </div>
          {/* The source is a Git-managed, provider-agnostic Media Asset URL. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={portfolio.profile.avatarSrc}
            alt={portfolio.profile.avatarAlt}
            width={256}
            height={256}
            className="aspect-square w-48 rounded-[2rem] object-cover shadow-sm md:w-64"
          />
        </header>

        <PortfolioProfileSection title={copy.skills} emptyLabel={copy.empty} isEmpty={portfolio.skills.length === 0}>
          <div className="grid gap-7 sm:grid-cols-2">
            {portfolio.skills.map((group) => (
              <div key={group.category}>
                <h3 className="font-semibold text-stone-900">{group.category}</h3>
                <p className="mt-2 leading-7 text-stone-600">{group.items.join(" · ")}</p>
              </div>
            ))}
          </div>
        </PortfolioProfileSection>

        <PortfolioProfileSection title={copy.experience} emptyLabel={copy.empty} isEmpty={portfolio.experience.length === 0}>
          <div className="space-y-10">
            {portfolio.experience.map((item) => (
              <article key={`${item.organization}-${item.role}-${item.start}`}>
                <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-baseline">
                  <div>
                    <h3 className="text-lg font-semibold text-stone-950">{item.role}</h3>
                    <p className="text-stone-600">{item.organization}</p>
                  </div>
                  <p className="text-sm text-stone-500">{item.start} — {item.end}</p>
                </div>
                <p className="mt-4 leading-7 text-stone-700">{item.summary}</p>
                {item.highlights.length > 0 && (
                  <ul className="mt-4 list-disc space-y-2 pl-5 text-stone-600">
                    {item.highlights.map((highlight) => <li key={highlight}>{highlight}</li>)}
                  </ul>
                )}
              </article>
            ))}
          </div>
        </PortfolioProfileSection>

        <PortfolioProfileSection
          title={copy.clientProjects}
          emptyLabel={copy.empty}
          isEmpty={portfolio.clientProjects.length === 0}
        >
          <div className="space-y-6">
            {portfolio.clientProjects.map((project) => (
              <article
                key={project.name}
                className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8"
              >
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                  <div>
                    <h3 className="text-xl font-semibold tracking-tight text-stone-950">
                      {project.name}
                    </h3>
                    <p className="mt-1 text-sm font-medium text-amber-800">
                      {project.role}
                    </p>
                  </div>
                  {project.scale && (
                    <p className="shrink-0 text-sm text-stone-500">
                      {copy.projectScale}: {project.scale}
                    </p>
                  )}
                </div>
                <p className="mt-5 leading-7 text-stone-700">{project.summary}</p>
                {project.highlights.length > 0 && (
                  <ul className="mt-4 list-disc space-y-2 pl-5 text-stone-600">
                    {project.highlights.map((highlight) => (
                      <li key={highlight}>{highlight}</li>
                    ))}
                  </ul>
                )}
              </article>
            ))}
          </div>
        </PortfolioProfileSection>

        <PortfolioProfileSection title={copy.education} emptyLabel={copy.empty} isEmpty={portfolio.education.length === 0}>
          <div className="space-y-8">
            {portfolio.education.map((item) => (
              <article key={`${item.institution}-${item.qualification}-${item.start}`}>
                <h3 className="text-lg font-semibold text-stone-950">{item.qualification}</h3>
                <p className="mt-1 text-stone-600">{item.institution}</p>
                <p className="mt-1 text-sm text-stone-500">{item.start} — {item.end}</p>
                {item.details && <p className="mt-3 leading-7 text-stone-600">{item.details}</p>}
              </article>
            ))}
          </div>
        </PortfolioProfileSection>

        <PortfolioProfileSection title={copy.certifications} emptyLabel={copy.empty} isEmpty={portfolio.certifications.length === 0}>
          <div className="space-y-6">
            {portfolio.certifications.map((item) => (
              <article key={`${item.name}-${item.issuer}-${item.date}`}>
                <h3 className="font-semibold text-stone-950">{item.name}</h3>
                <p className="mt-1 text-stone-600">{item.issuer} · {item.date}</p>
                {item.credentialUrl && (
                  <a href={item.credentialUrl} className="mt-2 inline-block text-sm font-medium text-amber-800 underline underline-offset-4">
                    {copy.credential}
                  </a>
                )}
              </article>
            ))}
          </div>
        </PortfolioProfileSection>

        <section className="border-t border-stone-200 py-14 sm:py-20">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-semibold tracking-[0.18em] text-amber-700 uppercase">{copy.featured}</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-stone-950">{copy.featuredIntroduction}</h2>
            </div>
            <Link href={localizedRoute("/projects", locale)} className="inline-flex items-center gap-2 text-sm font-medium text-stone-800">
              {copy.allProjects} <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
          <div className="mt-8 grid gap-5 lg:grid-cols-3">
            {home.featuredProjects.map((project) => (
              <FeaturedProjectOverview key={project.fullName} project={project} locale={locale} />
            ))}
          </div>
        </section>

        <ActivitySummary result={home.activity} locale={locale} />

        <section className="py-14 sm:py-20">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-semibold tracking-[0.18em] text-amber-700 uppercase">{copy.journalPreview}</p>
              <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight text-stone-950">{copy.journalIntroduction}</h2>
            </div>
            <Link href={localizedRoute("/journal", locale)} className="inline-flex items-center gap-2 text-sm font-medium text-stone-800">
              {copy.allArticles} <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
          {home.journalPreview.length === 0 ? (
            <p className="mt-8 rounded-3xl border border-dashed border-stone-300 bg-white px-6 py-12 text-center text-stone-500">{copy.noArticles}</p>
          ) : (
            <div className="mt-8 grid gap-5 md:grid-cols-3">
              {home.journalPreview.map((article) => (
                <article key={article.id} className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
                  <p className="text-xs text-stone-500">{copy.updated} {formatDate(article.updatedAt, locale)}</p>
                  <h3 className="mt-3 text-xl font-semibold tracking-tight text-stone-950">
                    <Link href={`/articles/${article.slug}`} className="hover:underline">{article.title}</Link>
                  </h3>
                  <p className="mt-4 text-sm leading-7 text-stone-600">{article.excerpt}</p>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
