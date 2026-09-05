import { RefreshCw } from "lucide-react";
import type { PortfolioLocale } from "@/lib/portfolio-profile";

export function GitHubRefreshButton({
  locale,
  label,
}: {
  locale: PortfolioLocale;
  label: string;
}) {
  return (
    <form method="get">
      {locale === "en" && <input type="hidden" name="lang" value="en" />}
      <button
        type="submit"
        className="inline-flex items-center gap-2 rounded-full border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-800 transition hover:border-amber-600 hover:text-amber-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-700"
      >
        <RefreshCw className="size-4" aria-hidden="true" />
        {label}
      </button>
    </form>
  );
}
