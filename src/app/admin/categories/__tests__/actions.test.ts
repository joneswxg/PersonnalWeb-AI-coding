import { describe, expect, it, vi, beforeEach } from "vitest";

const { requireOwnerMock, createCategoryMock, renameCategoryMock, deleteCategoryWithMigrationMock } =
  vi.hoisted(() => ({
    requireOwnerMock: vi.fn(),
    createCategoryMock: vi.fn(),
    renameCategoryMock: vi.fn(),
    deleteCategoryWithMigrationMock: vi.fn(),
  }));

vi.mock("@/lib/authz", () => ({
  requireOwner: requireOwnerMock,
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("@/lib/categories", () => ({
  createCategory: createCategoryMock,
  renameCategory: renameCategoryMock,
  deleteCategoryWithMigration: deleteCategoryWithMigrationMock,
}));

import { createCategory, renameCategory, deleteCategory } from "../actions";

beforeEach(() => {
  requireOwnerMock.mockReset();
  createCategoryMock.mockReset();
  renameCategoryMock.mockReset();
  deleteCategoryWithMigrationMock.mockReset();
});

function formDataWith(values: Record<string, string>) {
  const fd = new FormData();
  for (const [key, value] of Object.entries(values)) {
    fd.set(key, value);
  }
  return fd;
}

describe("category admin actions: owner-only enforcement", () => {
  it("createCategory rejects and never touches the db when not owner", async () => {
    requireOwnerMock.mockRejectedValueOnce(new Error("Forbidden"));
    await expect(createCategory(formDataWith({ name: "Rust" }))).rejects.toThrow("Forbidden");
    expect(createCategoryMock).not.toHaveBeenCalled();
  });

  it("renameCategory rejects and never touches the db when not owner", async () => {
    requireOwnerMock.mockRejectedValueOnce(new Error("Forbidden"));
    await expect(
      renameCategory(1, formDataWith({ name: "New name" })),
    ).rejects.toThrow("Forbidden");
    expect(renameCategoryMock).not.toHaveBeenCalled();
  });

  it("deleteCategory rejects and never touches the db when not owner", async () => {
    requireOwnerMock.mockRejectedValueOnce(new Error("Forbidden"));
    await expect(
      deleteCategory(1, formDataWith({ migrateToCategoryId: "2" })),
    ).rejects.toThrow("Forbidden");
    expect(deleteCategoryWithMigrationMock).not.toHaveBeenCalled();
  });
});

describe("category admin actions: happy path delegates to lib", () => {
  beforeEach(() => {
    requireOwnerMock.mockResolvedValue(undefined);
  });

  it("createCategory passes the trimmed name through", async () => {
    await createCategory(formDataWith({ name: "Rust" }));
    expect(createCategoryMock).toHaveBeenCalledWith("Rust");
  });

  it("renameCategory passes the category id and new name through", async () => {
    await renameCategory(5, formDataWith({ name: "Renamed" }));
    expect(renameCategoryMock).toHaveBeenCalledWith(5, "Renamed");
  });

  it("deleteCategory parses and passes the migration target id through", async () => {
    await deleteCategory(5, formDataWith({ migrateToCategoryId: "7" }));
    expect(deleteCategoryWithMigrationMock).toHaveBeenCalledWith(5, 7);
  });

  it("deleteCategory rejects a missing/invalid migration target before calling the lib", async () => {
    await expect(deleteCategory(5, formDataWith({ migrateToCategoryId: "" }))).rejects.toThrow();
    expect(deleteCategoryWithMigrationMock).not.toHaveBeenCalled();
  });
});
