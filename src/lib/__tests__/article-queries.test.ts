import { describe, expect, it } from "vitest";
import { excerpt } from "@/lib/article-queries";

describe("excerpt", () => {
  it("strips code fences, headings, and emphasis markers", () => {
    const md = "# Title\n\nSome **bold** and _italic_ text.\n\n```js\nconsole.log(1)\n```";
    expect(excerpt(md)).toBe("Title Some bold and italic text.");
  });

  it("replaces markdown links with their text", () => {
    expect(excerpt("See [the docs](https://example.com) for more.")).toBe(
      "See the docs for more.",
    );
  });

  it("truncates long content with an ellipsis", () => {
    const long = "word ".repeat(100);
    const result = excerpt(long, 20);
    expect(result.length).toBe(21); // 20 chars + ellipsis
    expect(result.endsWith("…")).toBe(true);
  });
});
