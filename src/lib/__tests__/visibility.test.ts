import { describe, expect, it } from "vitest";
import { canViewStatus, visibleStatusesFor } from "@/lib/visibility";
import type { ArticleStatus } from "@/db/schema";
import type { Role } from "@/lib/roles";

const allStatuses: ArticleStatus[] = ["draft", "private", "public"];
const allRoles: Role[] = ["visitor", "trusted", "owner"];

describe("canViewStatus", () => {
  it("lets visitors see only public", () => {
    expect(canViewStatus("visitor", "public")).toBe(true);
    expect(canViewStatus("visitor", "private")).toBe(false);
    expect(canViewStatus("visitor", "draft")).toBe(false);
  });

  it("lets trusted users see public and private, never draft", () => {
    expect(canViewStatus("trusted", "public")).toBe(true);
    expect(canViewStatus("trusted", "private")).toBe(true);
    expect(canViewStatus("trusted", "draft")).toBe(false);
  });

  it("lets the owner see public and private on public-facing pages", () => {
    expect(canViewStatus("owner", "public")).toBe(true);
    expect(canViewStatus("owner", "private")).toBe(true);
  });

  it("never lets draft leak onto public-facing pages, not even for the owner", () => {
    for (const role of allRoles) {
      expect(canViewStatus(role, "draft")).toBe(false);
    }
  });
});

describe("visibleStatusesFor", () => {
  it("matches canViewStatus for every role/status combination", () => {
    for (const role of allRoles) {
      const visible = visibleStatusesFor(role);
      for (const status of allStatuses) {
        expect(visible.includes(status)).toBe(canViewStatus(role, status));
      }
    }
  });
});
