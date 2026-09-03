export type PortfolioLocale = "zh" | "en";

export type LocalizedText = {
  zh: string;
  en?: string;
};

export type PortfolioProfileData = {
  version: 1;
  profile: {
    name: LocalizedText;
    title: LocalizedText;
    summary: LocalizedText;
    avatar: {
      src: string;
      alt: LocalizedText;
    };
    githubUrl: string;
  };
  skills: Array<{
    category: LocalizedText;
    items: LocalizedText[];
  }>;
  experience: Array<{
    organization: LocalizedText;
    role: LocalizedText;
    start: string;
    end: LocalizedText;
    summary: LocalizedText;
    highlights: LocalizedText[];
  }>;
  education: Array<{
    institution: LocalizedText;
    qualification: LocalizedText;
    start: string;
    end: string;
    details?: LocalizedText;
  }>;
  certifications: Array<{
    name: LocalizedText;
    issuer: LocalizedText;
    date: string;
    credentialUrl?: string;
  }>;
  featuredProjects: string[];
  projectRules: {
    excludedRepositories: string[];
    admittedForks: Array<{
      repository: string;
      upstream: string;
      attribution: LocalizedText;
    }>;
  };
};

export type PortfolioProfilePresentation = {
  locale: PortfolioLocale;
  profile: {
    name: string;
    title: string;
    summary: string;
    avatarSrc: string;
    avatarAlt: string;
    githubUrl: string;
  };
  skills: Array<{ category: string; items: string[] }>;
  experience: Array<{
    organization: string;
    role: string;
    start: string;
    end: string;
    summary: string;
    highlights: string[];
  }>;
  education: Array<{
    institution: string;
    qualification: string;
    start: string;
    end: string;
    details?: string;
  }>;
  certifications: Array<{
    name: string;
    issuer: string;
    date: string;
    credentialUrl?: string;
  }>;
  featuredProjects: string[];
  projectRules: {
    excludedRepositories: string[];
    admittedForks: Array<{
      repository: string;
      upstream: string;
      attribution: string;
    }>;
  };
};

const PROFILE_DATA_BLOCK =
  /<!--\s*portfolio-profile:start\s*-->\s*```json\s*([\s\S]*?)\s*```\s*<!--\s*portfolio-profile:end\s*-->/;

function fail(path: string, expected: string): never {
  throw new Error(`Invalid Portfolio Profile data at ${path}: expected ${expected}.`);
}

function objectAt(value: unknown, path: string): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return fail(path, "an object");
  }
  return value as Record<string, unknown>;
}

function stringAt(value: unknown, path: string): string {
  if (typeof value !== "string" || value.trim() === "") {
    return fail(path, "a non-empty string");
  }
  return value;
}

function optionalStringAt(value: unknown, path: string): string | undefined {
  return value === undefined ? undefined : stringAt(value, path);
}

function httpsUrlAt(value: unknown, path: string): string {
  const url = stringAt(value, path);
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return fail(path, "a valid HTTPS URL");
  }
  if (parsed.protocol !== "https:") {
    return fail(path, "a valid HTTPS URL");
  }
  return url;
}

function arrayAt<T>(
  value: unknown,
  path: string,
  readItem: (item: unknown, itemPath: string) => T,
): T[] {
  if (!Array.isArray(value)) {
    return fail(path, "an array");
  }
  return value.map((item, index) => readItem(item, `${path}[${index}]`));
}

function localizedTextAt(value: unknown, path: string): LocalizedText {
  const object = objectAt(value, path);
  return {
    zh: stringAt(object.zh, `${path}.zh`),
    en: optionalStringAt(object.en, `${path}.en`),
  };
}

function profileDataAt(value: unknown): PortfolioProfileData {
  const root = objectAt(value, "root");
  if (root.version !== 1) {
    return fail("version", "the supported version 1");
  }

  const profile = objectAt(root.profile, "profile");
  const avatar = objectAt(profile.avatar, "profile.avatar");

  return {
    version: 1,
    profile: {
      name: localizedTextAt(profile.name, "profile.name"),
      title: localizedTextAt(profile.title, "profile.title"),
      summary: localizedTextAt(profile.summary, "profile.summary"),
      avatar: {
        src: httpsUrlAt(avatar.src, "profile.avatar.src"),
        alt: localizedTextAt(avatar.alt, "profile.avatar.alt"),
      },
      githubUrl: httpsUrlAt(profile.githubUrl, "profile.githubUrl"),
    },
    skills: arrayAt(root.skills, "skills", (value, path) => {
      const skillGroup = objectAt(value, path);
      return {
        category: localizedTextAt(skillGroup.category, `${path}.category`),
        items: arrayAt(skillGroup.items, `${path}.items`, localizedTextAt),
      };
    }),
    experience: arrayAt(root.experience, "experience", (value, path) => {
      const experience = objectAt(value, path);
      return {
        organization: localizedTextAt(
          experience.organization,
          `${path}.organization`,
        ),
        role: localizedTextAt(experience.role, `${path}.role`),
        start: stringAt(experience.start, `${path}.start`),
        end: localizedTextAt(experience.end, `${path}.end`),
        summary: localizedTextAt(experience.summary, `${path}.summary`),
        highlights: arrayAt(
          experience.highlights,
          `${path}.highlights`,
          localizedTextAt,
        ),
      };
    }),
    education: arrayAt(root.education, "education", (value, path) => {
      const education = objectAt(value, path);
      return {
        institution: localizedTextAt(
          education.institution,
          `${path}.institution`,
        ),
        qualification: localizedTextAt(
          education.qualification,
          `${path}.qualification`,
        ),
        start: stringAt(education.start, `${path}.start`),
        end: stringAt(education.end, `${path}.end`),
        details:
          education.details === undefined
            ? undefined
            : localizedTextAt(education.details, `${path}.details`),
      };
    }),
    certifications: arrayAt(
      root.certifications,
      "certifications",
      (value, path) => {
        const certification = objectAt(value, path);
        const credentialUrl = optionalStringAt(
          certification.credentialUrl,
          `${path}.credentialUrl`,
        );
        return {
          name: localizedTextAt(certification.name, `${path}.name`),
          issuer: localizedTextAt(certification.issuer, `${path}.issuer`),
          date: stringAt(certification.date, `${path}.date`),
          credentialUrl:
            credentialUrl === undefined
              ? undefined
              : httpsUrlAt(credentialUrl, `${path}.credentialUrl`),
        };
      },
    ),
    featuredProjects: arrayAt(
      root.featuredProjects,
      "featuredProjects",
      stringAt,
    ),
    projectRules: readProjectRules(root.projectRules),
  };
}

function readProjectRules(value: unknown): PortfolioProfileData["projectRules"] {
  const rules = objectAt(value, "projectRules");
  return {
    excludedRepositories: arrayAt(
      rules.excludedRepositories,
      "projectRules.excludedRepositories",
      stringAt,
    ),
    admittedForks: arrayAt(
      rules.admittedForks,
      "projectRules.admittedForks",
      (value, path) => {
        const fork = objectAt(value, path);
        return {
          repository: stringAt(fork.repository, `${path}.repository`),
          upstream: stringAt(fork.upstream, `${path}.upstream`),
          attribution: localizedTextAt(
            fork.attribution,
            `${path}.attribution`,
          ),
        };
      },
    ),
  };
}

export function parsePortfolioProfileMarkdown(
  markdown: string,
): PortfolioProfileData {
  const block = markdown.match(PROFILE_DATA_BLOCK);
  if (!block) {
    throw new Error(
      "The Markdown document must contain a marked portfolio-profile data block.",
    );
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(block[1]);
  } catch (error) {
    const detail = error instanceof Error ? ` ${error.message}` : "";
    throw new Error(`The portfolio-profile data block is not valid JSON.${detail}`);
  }

  return profileDataAt(parsed);
}

function localize(value: LocalizedText, locale: PortfolioLocale): string {
  return locale === "en" ? value.en ?? value.zh : value.zh;
}

export function buildPortfolioProfilePresentation(
  data: PortfolioProfileData,
  locale: PortfolioLocale = "zh",
): PortfolioProfilePresentation {
  return {
    locale,
    profile: {
      name: localize(data.profile.name, locale),
      title: localize(data.profile.title, locale),
      summary: localize(data.profile.summary, locale),
      avatarSrc: data.profile.avatar.src,
      avatarAlt: localize(data.profile.avatar.alt, locale),
      githubUrl: data.profile.githubUrl,
    },
    skills: data.skills.map((group) => ({
      category: localize(group.category, locale),
      items: group.items.map((item) => localize(item, locale)),
    })),
    experience: data.experience.map((item) => ({
      organization: localize(item.organization, locale),
      role: localize(item.role, locale),
      start: item.start,
      end: localize(item.end, locale),
      summary: localize(item.summary, locale),
      highlights: item.highlights.map((highlight) => localize(highlight, locale)),
    })),
    education: data.education.map((item) => ({
      institution: localize(item.institution, locale),
      qualification: localize(item.qualification, locale),
      start: item.start,
      end: item.end,
      details: item.details ? localize(item.details, locale) : undefined,
    })),
    certifications: data.certifications.map((item) => ({
      name: localize(item.name, locale),
      issuer: localize(item.issuer, locale),
      date: item.date,
      credentialUrl: item.credentialUrl,
    })),
    featuredProjects: data.featuredProjects,
    projectRules: {
      excludedRepositories: data.projectRules.excludedRepositories,
      admittedForks: data.projectRules.admittedForks.map((fork) => ({
        repository: fork.repository,
        upstream: fork.upstream,
        attribution: localize(fork.attribution, locale),
      })),
    },
  };
}
