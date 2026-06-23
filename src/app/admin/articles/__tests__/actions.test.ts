import { describe, expect, it, vi, beforeEach } from "vitest";

const {
  requireOwnerMock,
  updateSetMock,
  whereMock,
  updateMock,
  deleteWhereMock,
  deleteMock,
  insertValuesMock,
  insertReturningMock,
  insertMock,
  selectLimitMock,
  selectWhereMock,
  selectFromMock,
  selectMock,
  generateUniqueArticleSlugMock,
  resolveTagsByNamesMock,
  setArticleTagsMock,
} = vi.hoisted(() => {
  const updateSetMock = vi.fn();
  const whereMock = vi.fn();
  const deleteWhereMock = vi.fn();
  const insertReturningMock = vi.fn();
  const insertValuesMock = vi.fn(() => ({ returning: insertReturningMock }));
  const selectLimitMock = vi.fn();
  const selectWhereMock = vi.fn(() => ({ limit: selectLimitMock }));
  const selectFromMock = vi.fn(() => ({ where: selectWhereMock }));
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
    insertValuesMock,
    insertReturningMock,
    insertMock: vi.fn(() => ({ values: insertValuesMock })),
    selectLimitMock,
    selectWhereMock,
    selectFromMock,
    selectMock: vi.fn(() => ({ from: selectFromMock })),
    generateUniqueArticleSlugMock: vi.fn(),
    resolveTagsByNamesMock: vi.fn(),
    setArticleTagsMock: vi.fn(),
  };
});

vi.mock("@/lib/authz", () => ({
  requireOwner: requireOwnerMock,
  ForbiddenError: class ForbiddenError extends Error {},
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
}));

vi.mock("@/db", () => ({
  db: { update: updateMock, delete: deleteMock, insert: insertMock, select: selectMock },
}));

vi.mock("@/lib/articles", () => ({
  isArticleStatus: (value: string) => ["draft", "private", "public"].includes(value),
  parseTagsInput: (value: string) =>
    value
      .split(",")
      .map((t: string) => t.trim())
      .filter(Boolean),
  generateUniqueArticleSlug: generateUniqueArticleSlugMock,
  resolveTagsByNames: resolveTagsByNamesMock,
  setArticleTags: setArticleTagsMock,
}));

import { setArticleStatus, deleteArticle, createArticle, updateArticle } from "../actions";

function formDataWith(values: Record<string, string>) {
  const fd = new FormData();
  for (const [key, value] of Object.entries(values)) {
    fd.set(key, value);
  }
  return fd;
}

beforeEach(() => {
  requireOwnerMock.mockReset();
  updateSetMock.mockReset();
  whereMock.mockReset();
  deleteWhereMock.mockReset();
  deleteMock.mockClear();
  insertValuesMock.mockClear();
  insertReturningMock.mockReset();
  insertMock.mockClear();
  selectLimitMock.mockReset();
  selectWhereMock.mockClear();
  selectFromMock.mockClear();
  selectMock.mockClear();
  generateUniqueArticleSlugMock.mockReset();
  resolveTagsByNamesMock.mockReset();
  setArticleTagsMock.mockReset();
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

describe("createArticle admin-only enforcement", () => {
  it("rejects and never touches the database when the caller is not the owner", async () => {
    requireOwnerMock.mockRejectedValueOnce(new Error("Forbidden"));

    await expect(
      createArticle(formDataWith({ title: "Hello", categoryId: "1" })),
    ).rejects.toThrow("Forbidden");
    expect(insertMock).not.toHaveBeenCalled();
  });
});

describe("createArticle", () => {
  beforeEach(() => {
    requireOwnerMock.mockResolvedValue(undefined);
    generateUniqueArticleSlugMock.mockResolvedValue("hello");
    resolveTagsByNamesMock.mockResolvedValue([]);
    insertReturningMock.mockResolvedValue([{ id: 1 }]);
  });

  it("rejects a missing categoryId before touching the database", async () => {
    await expect(createArticle(formDataWith({ title: "Hello" }))).rejects.toThrow(
      /Category is required/,
    );
    expect(insertMock).not.toHaveBeenCalled();
  });

  it("rejects a non-numeric categoryId before touching the database", async () => {
    await expect(
      createArticle(formDataWith({ title: "Hello", categoryId: "not-a-number" })),
    ).rejects.toThrow(/Category is required/);
    expect(insertMock).not.toHaveBeenCalled();
  });

  it("inserts the article with the numeric categoryId from the form", async () => {
    await createArticle(formDataWith({ title: "Hello", categoryId: "3" }));
    expect(insertValuesMock).toHaveBeenCalledWith(
      expect.objectContaining({ categoryId: 3, title: "Hello" }),
    );
  });
});

describe("updateArticle admin-only enforcement", () => {
  it("rejects and never touches the database when the caller is not the owner", async () => {
    requireOwnerMock.mockRejectedValueOnce(new Error("Forbidden"));

    await expect(
      updateArticle(1, formDataWith({ title: "Hello", categoryId: "1" })),
    ).rejects.toThrow("Forbidden");
    expect(updateSetMock).not.toHaveBeenCalled();
  });
});

describe("updateArticle", () => {
  beforeEach(() => {
    requireOwnerMock.mockResolvedValue(undefined);
    resolveTagsByNamesMock.mockResolvedValue([]);
    selectLimitMock.mockResolvedValue([{ title: "Hello", slug: "hello" }]);
  });

  it("rejects a missing categoryId before touching the database", async () => {
    await expect(updateArticle(1, formDataWith({ title: "Hello" }))).rejects.toThrow(
      /Category is required/,
    );
    expect(updateSetMock).not.toHaveBeenCalled();
  });

  it("updates the article with the numeric categoryId from the form", async () => {
    await updateArticle(1, formDataWith({ title: "Hello", categoryId: "5" }));
    expect(updateSetMock).toHaveBeenCalledWith(
      expect.objectContaining({ categoryId: 5, title: "Hello" }),
    );
  });
});
