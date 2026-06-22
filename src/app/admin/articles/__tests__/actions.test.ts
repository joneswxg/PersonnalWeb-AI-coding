import { describe, expect, it, vi, beforeEach } from "vitest";

const { requireOwnerMock, updateSetMock, whereMock, updateMock, deleteWhereMock, deleteMock } =
  vi.hoisted(() => {
    const updateSetMock = vi.fn();
    const whereMock = vi.fn();
    const deleteWhereMock = vi.fn();
    return {
      requireOwnerMock: vi.fn(),
      updateSetMock,
      whereMock,
      updateMock: vi.fn(() => ({
        set: (...args: unknown[]) => {
          updateSetMock(...args);
          return { where: whereMock };
        },
      })),
      deleteWhereMock,
      deleteMock: vi.fn(() => ({ where: deleteWhereMock })),
    };
  });

vi.mock("@/lib/authz", () => ({
  requireOwner: requireOwnerMock,
  ForbiddenError: class ForbiddenError extends Error {},
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("@/db", () => ({
  db: { update: updateMock, delete: deleteMock },
}));

import { setArticleStatus, deleteArticle } from "../actions";

beforeEach(() => {
  requireOwnerMock.mockReset();
  updateSetMock.mockReset();
  whereMock.mockReset();
  deleteWhereMock.mockReset();
  deleteMock.mockClear();
});

describe("setArticleStatus admin-only enforcement", () => {
  it("rejects and never touches the database when the caller is not the owner", async () => {
    requireOwnerMock.mockRejectedValueOnce(new Error("Forbidden"));

    await expect(setArticleStatus(1, "public")).rejects.toThrow("Forbidden");
    expect(updateSetMock).not.toHaveBeenCalled();
  });
});

describe("setArticleStatus state machine", () => {
  beforeEach(() => {
    requireOwnerMock.mockResolvedValue(undefined);
  });

  it.each([
    ["draft", "private"],
    ["private", "public"],
    ["public", "private"],
    ["private", "draft"],
    ["public", "draft"],
    ["draft", "public"],
  ] as const)("allows transitioning from %s to %s in either direction", async (_from, to) => {
    await setArticleStatus(1, to);
    expect(updateSetMock).toHaveBeenCalledWith(
      expect.objectContaining({ status: to }),
    );
  });

  it("rejects an invalid status even for the owner", async () => {
    // @ts-expect-error intentionally invalid status to exercise the runtime guard
    await expect(setArticleStatus(1, "published")).rejects.toThrow(/Invalid status/);
    expect(updateSetMock).not.toHaveBeenCalled();
  });
});

describe("deleteArticle admin-only enforcement", () => {
  it("rejects and never touches the database when the caller is not the owner", async () => {
    requireOwnerMock.mockRejectedValueOnce(new Error("Forbidden"));

    await expect(deleteArticle(1)).rejects.toThrow("Forbidden");
    expect(deleteMock).not.toHaveBeenCalled();
  });
});

describe("deleteArticle", () => {
  beforeEach(() => {
    requireOwnerMock.mockResolvedValue(undefined);
  });

  it("deletes the article by id when called by the owner", async () => {
    await deleteArticle(42);
    expect(deleteMock).toHaveBeenCalledTimes(1);
    expect(deleteWhereMock).toHaveBeenCalledTimes(1);
  });
});
