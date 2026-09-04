import "server-only";

import { getRole } from "@/lib/roles";
import { listArticlesForRole } from "@/lib/article-queries";
import { loadPortfolioProfilePresentation } from "@/lib/portfolio-profile-source";
import { loadPublicProjectDirectoryWithActivity } from "@/lib/github-projects-source";
import { buildPortfolioHome } from "@/lib/portfolio-home";
import type { PortfolioLocale } from "@/lib/portfolio-profile";

export async function loadPortfolioHome(locale: PortfolioLocale = "zh") {
  const role = await getRole();
  const [portfolio, directory, visibleArticles] = await Promise.all([
    loadPortfolioProfilePresentation(locale),
    loadPublicProjectDirectoryWithActivity(locale),
    listArticlesForRole(role),
  ]);

  return buildPortfolioHome({ portfolio, directory, visibleArticles });
}
