import { describe, expect, it } from "vitest";
import { slugify } from "@/lib/slug";
import { isArticleStatus, parseTagsInput } from "@/lib/articles";

describe("slugify", () => {
  it("lowercases and hyphenates ascii titles", () => {
    expect(slugify("Learning Rust Async")).toBe("learning-rust-async");
  });

  it("collapses punctuation and trims leading/trailing hyphens", () => {
    expect(slugify("  Hello, World!! ")).toBe("hello-world");
  });

  it("returns an empty string for titles with no ascii alphanumerics", () => {
    expect(slugify("学习笔记")).toBe("");
  });
});

describe("isArticleStatus", () => {
  it("accepts the three known statuses", () => {
    expect(isArticleStatus("draft")).toBe(true);
    expect(isArticleStatus("private")).toBe(true);
    expect(isArticleStatus("public")).toBe(true);
  });

  it("rejects anything else", () => {
    expect(isArticleStatus("published")).toBe(false);
    expect(isArticleStatus("")).toBe(false);
  });
});

describe("parseTagsInput", () => {
  it("splits, trims, and drops empty entries", () => {
    expect(parseTagsInput(" rust, async , , tokio ")).toEqual([
      "rust",
      "async",
      "tokio",
    ]);
  });

  it("returns an empty array for blank input", () => {
    expect(parseTagsInput("   ")).toEqual([]);
  });
});
