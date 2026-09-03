import { readFile } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  buildPortfolioProfilePresentation,
  parsePortfolioProfileMarkdown,
} from "@/lib/portfolio-profile";

const fixturesDirectory = path.join(
  process.cwd(),
  "src/lib/__tests__/fixtures",
);

async function readFixture(name: string) {
  return readFile(path.join(fixturesDirectory, name), "utf8");
}

describe("parsePortfolioProfileMarkdown", () => {
  it("parses the Git-Managed Profile Data document", async () => {
    const source = await readFixture("profile-complete.md");

    const profile = parsePortfolioProfileMarkdown(source);

    expect(profile.version).toBe(1);
    expect(profile.profile.name).toEqual({ zh: "王小明", en: "Xiaoming Wang" });
    expect(profile.featuredProjects).toEqual([
      "project-one",
      "project-two",
      "project-three",
    ]);
    expect(profile.projectRules.admittedForks[0]).toMatchObject({
      repository: "adapted-fork",
      upstream: "upstream/original",
    });
  });

  it("rejects a document without the marked profile data block", () => {
    expect(() => parsePortfolioProfileMarkdown("# Profile\n\nNo data here.")).toThrow(
      "portfolio-profile data block",
    );
  });
});

describe("buildPortfolioProfilePresentation", () => {
  it("maps every résumé section for the default Chinese presentation", async () => {
    const source = await readFixture("profile-complete.md");

    const presentation = buildPortfolioProfilePresentation(
      parsePortfolioProfileMarkdown(source),
      "zh",
    );

    expect(presentation.locale).toBe("zh");
    expect(presentation.profile).toMatchObject({
      name: "王小明",
      title: "软件工程师",
      summary: "专注于可靠的 Web 产品。",
      avatarAlt: "王小明的头像",
    });
    expect(presentation.skills[0]).toEqual({
      category: "前端",
      items: ["React", "无障碍设计"],
    });
    expect(presentation.experience[0]).toMatchObject({
      organization: "示例科技",
      role: "高级工程师",
      end: "至今",
      highlights: ["改进发布可靠性。", "建立工程规范。"],
    });
    expect(presentation.education[0]).toMatchObject({
      institution: "示例大学",
      qualification: "计算机科学学士",
    });
    expect(presentation.certifications[0]).toMatchObject({
      name: "云架构认证",
      issuer: "示例机构",
    });
  });

  it("uses English translations field by field and falls back to Chinese", async () => {
    const source = await readFixture("profile-complete.md");

    const presentation = buildPortfolioProfilePresentation(
      parsePortfolioProfileMarkdown(source),
      "en",
    );

    expect(presentation.profile.name).toBe("Xiaoming Wang");
    expect(presentation.profile.summary).toBe("专注于可靠的 Web 产品。");
    expect(presentation.skills[0].items).toEqual(["React", "无障碍设计"]);
    expect(presentation.experience[0].highlights).toEqual([
      "Improved release reliability.",
      "建立工程规范。",
    ]);
    expect(presentation.education[0].details).toBe("主修软件工程。");
  });

  it("preserves empty optional résumé sections for explicit empty handling", async () => {
    const source = await readFixture("profile-empty-optional.md");

    const presentation = buildPortfolioProfilePresentation(
      parsePortfolioProfileMarkdown(source),
      "zh",
    );

    expect(presentation.skills).toEqual([]);
    expect(presentation.experience).toEqual([]);
    expect(presentation.education).toEqual([]);
    expect(presentation.certifications).toEqual([]);
  });
});
