import { describe, expect, it } from "vitest";
import { stripDuplicateLeadingHeading } from "@/lib/markdown";

describe("stripDuplicateLeadingHeading", () => {
  it("removes a leading H1 that duplicates the title", () => {
    const content = "# My Article\n\nSome body text.";
    expect(stripDuplicateLeadingHeading(content, "My Article")).toBe("Some body text.");
  });

  it("matches case-insensitively and ignores surrounding whitespace", () => {
    const content = "#   my ARTICLE  \nBody text.";
    expect(stripDuplicateLeadingHeading(content, "  My Article ")).toBe("Body text.");
  });

  it("preserves a leading heading that does not match the title", () => {
    const content = "# Something else\n\nBody text.";
    expect(stripDuplicateLeadingHeading(content, "My Article")).toBe(content);
  });

  it("preserves a matching heading that appears later, not as the first line", () => {
    const content = "Intro paragraph.\n\n# My Article\n\nMore text.";
    expect(stripDuplicateLeadingHeading(content, "My Article")).toBe(content);
  });

  it("returns content unchanged when there is no leading heading at all", () => {
    const content = "Just a plain paragraph with no heading.";
    expect(stripDuplicateLeadingHeading(content, "My Article")).toBe(content);
  });

  it("handles content that is only the duplicate heading", () => {
    expect(stripDuplicateLeadingHeading("# My Article", "My Article")).toBe("");
  });

  it("does not require a blank line after the removed heading", () => {
    const content = "# My Article\nBody text immediately after.";
    expect(stripDuplicateLeadingHeading(content, "My Article")).toBe(
      "Body text immediately after.",
    );
  });
});
