import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { GitHubRefreshButton } from "@/components/github-refresh-button";

describe("GitHubRefreshButton", () => {
  it("submits the current Chinese page without adding a language parameter", () => {
    const markup = renderToStaticMarkup(
      <GitHubRefreshButton locale="zh" label="重新获取 GitHub 数据" />,
    );

    expect(markup).toContain('method="get"');
    expect(markup).toContain("重新获取 GitHub 数据");
    expect(markup).not.toContain('name="lang"');
  });

  it("preserves the English locale when refreshing", () => {
    const markup = renderToStaticMarkup(
      <GitHubRefreshButton locale="en" label="Retry GitHub data" />,
    );

    expect(markup).toContain('name="lang"');
    expect(markup).toContain('value="en"');
  });
});
