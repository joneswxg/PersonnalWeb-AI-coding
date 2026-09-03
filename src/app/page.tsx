import Link from "next/link";
import { loadPortfolioProfilePresentation } from "@/lib/portfolio-profile-source";
import type { PortfolioLocale } from "@/lib/portfolio-profile";

type HomePageProps = {
  searchParams: Promise<{ lang?: string | string[] }>;
};

const labels = {
  zh: {
    skills: "核心技能",
    experience: "职业经历",
    education: "教育背景",
    certifications: "专业认证",
    empty: "内容尚未提供",
    github: "查看 GitHub",
    journal: "阅读技术文章",
    credential: "查看凭证",
  },
  en: {
    skills: "Core skills",
    experience: "Career experience",
    education: "Educational background",
    certifications: "Professional certifications",
    empty: "Content not supplied yet",
    github: "View GitHub",
    journal: "Read the Technical Journal",
    credential: "View credential",
  },
} as const;

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

export default async function HomePage({ searchParams }: HomePageProps) {
  const parameters = await searchParams;
  const locale: PortfolioLocale = parameters.lang === "en" ? "en" : "zh";
  const portfolio = await loadPortfolioProfilePresentation(locale);
  const copy = labels[locale];

  return (
    <div lang={locale === "zh" ? "zh-CN" : "en"} className="bg-stone-50">
      <div className="mx-auto max-w-5xl px-5 py-8 sm:px-8 sm:py-12">
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
              Portfolio Profile
            </p>
            <h1 className="text-4xl font-semibold tracking-tight text-stone-950 sm:text-6xl">
              {portfolio.profile.name}
            </h1>
            <p className="mt-4 text-xl text-stone-700 sm:text-2xl">
              {portfolio.profile.title}
            </p>
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
                href="/journal"
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

        <PortfolioProfileSection
          title={copy.skills}
          emptyLabel={copy.empty}
          isEmpty={portfolio.skills.length === 0}
        >
          <div className="grid gap-7 sm:grid-cols-2">
            {portfolio.skills.map((group) => (
              <div key={group.category}>
                <h3 className="font-semibold text-stone-900">{group.category}</h3>
                <p className="mt-2 leading-7 text-stone-600">{group.items.join(" · ")}</p>
              </div>
            ))}
          </div>
        </PortfolioProfileSection>

        <PortfolioProfileSection
          title={copy.experience}
          emptyLabel={copy.empty}
          isEmpty={portfolio.experience.length === 0}
        >
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
          title={copy.education}
          emptyLabel={copy.empty}
          isEmpty={portfolio.education.length === 0}
        >
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

        <PortfolioProfileSection
          title={copy.certifications}
          emptyLabel={copy.empty}
          isEmpty={portfolio.certifications.length === 0}
        >
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
      </div>
    </div>
  );
}
