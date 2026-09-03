import "server-only";

import { readFile } from "node:fs/promises";
import path from "node:path";
import {
  buildPortfolioProfilePresentation,
  parsePortfolioProfileMarkdown,
  type PortfolioLocale,
} from "@/lib/portfolio-profile";

const PROFILE_SOURCE_PATH = path.join(
  process.cwd(),
  "content/portfolio-profile.md",
);

export async function loadPortfolioProfileData() {
  const markdown = await readFile(PROFILE_SOURCE_PATH, "utf8");
  return parsePortfolioProfileMarkdown(markdown);
}

export async function loadPortfolioProfilePresentation(
  locale: PortfolioLocale = "zh",
) {
  return buildPortfolioProfilePresentation(
    await loadPortfolioProfileData(),
    locale,
  );
}
