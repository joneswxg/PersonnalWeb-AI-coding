import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/roles", () => ({
  getRole: vi.fn(),
}));

import { getRole } from "@/lib/roles";
import { requireOwner, ForbiddenError } from "@/lib/authz";

describe("requireOwner", () => {
  it("resolves without throwing when the role is owner", async () => {
    vi.mocked(getRole).mockResolvedValueOnce("owner");
    await expect(requireOwner()).resolves.toBeUndefined();
  });

  it("throws ForbiddenError when the role is trusted", async () => {
    vi.mocked(getRole).mockResolvedValueOnce("trusted");
    await expect(requireOwner()).rejects.toBeInstanceOf(ForbiddenError);
  });

  it("throws ForbiddenError when the role is visitor", async () => {
    vi.mocked(getRole).mockResolvedValueOnce("visitor");
    await expect(requireOwner()).rejects.toBeInstanceOf(ForbiddenError);
  });
});
