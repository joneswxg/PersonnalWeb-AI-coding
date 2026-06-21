import { describe, expect, it } from "vitest";
import { computeRole } from "@/lib/roles";

describe("computeRole", () => {
  it("resolves unauthenticated requests as visitor", () => {
    expect(
      computeRole({
        githubUsername: null,
        ownerGithubUsername: "alice",
        isOnTrustedAllowList: true,
      }),
    ).toBe("visitor");
  });

  it("resolves the configured owner username as owner", () => {
    expect(
      computeRole({
        githubUsername: "alice",
        ownerGithubUsername: "alice",
        isOnTrustedAllowList: false,
      }),
    ).toBe("owner");
  });

  it("resolves an allow-listed username as trusted", () => {
    expect(
      computeRole({
        githubUsername: "bob",
        ownerGithubUsername: "alice",
        isOnTrustedAllowList: true,
      }),
    ).toBe("trusted");
  });

  it("resolves an authenticated, non-allow-listed, non-owner username as visitor", () => {
    expect(
      computeRole({
        githubUsername: "mallory",
        ownerGithubUsername: "alice",
        isOnTrustedAllowList: false,
      }),
    ).toBe("visitor");
  });

  it("owner check takes precedence even if somehow also on the allow-list", () => {
    expect(
      computeRole({
        githubUsername: "alice",
        ownerGithubUsername: "alice",
        isOnTrustedAllowList: true,
      }),
    ).toBe("owner");
  });
});
