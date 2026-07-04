import { describe, expect, it, vi } from "vitest";

vi.mock("@/db", () => ({
  db: {},
}));

import {
  buildMarkdownImage,
  MAX_IMAGE_FILE_SIZE_BYTES,
  validateImageUpload,
} from "../media-asset-utils";

describe("validateImageUpload", () => {
  it("accepts supported image types within the size limit", () => {
    const file = new File(["ok"], "cover.png", { type: "image/png" });

    expect(() => validateImageUpload(file)).not.toThrow();
  });

  it("rejects unsupported image types", () => {
    const file = new File(["nope"], "cover.gif", { type: "image/gif" });

    expect(() => validateImageUpload(file)).toThrow(/Unsupported image type/);
  });

  it("rejects files larger than 10 MB", () => {
    const file = new File([new Uint8Array(MAX_IMAGE_FILE_SIZE_BYTES + 1)], "cover.webp", {
      type: "image/webp",
    });

    expect(() => validateImageUpload(file)).toThrow(/10 MB or smaller/);
  });
});

describe("buildMarkdownImage", () => {
  it("renders markdown with optional alt text", () => {
    expect(
      buildMarkdownImage({ altText: "Diagram", publicUrl: "https://example.com/a.png" }),
    ).toBe("![Diagram](https://example.com/a.png)");

    expect(
      buildMarkdownImage({ altText: null, publicUrl: "https://example.com/b.png" }),
    ).toBe("![](https://example.com/b.png)");
  });
});
