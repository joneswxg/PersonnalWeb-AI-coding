import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  requireOwnerMock,
  insertValuesMock,
  insertMock,
  selectLimitMock,
  selectWhereMock,
  selectFromMock,
  selectMock,
  deleteWhereMock,
  deleteMock,
  uploadMediaObjectMock,
  deleteMediaObjectMock,
  listMediaAssetsForEditorMock,
  validateImageUploadMock,
} = vi.hoisted(() => {
  const insertValuesMock = vi.fn();
  const selectLimitMock = vi.fn();
  const selectWhereMock = vi.fn(() => ({ limit: selectLimitMock }));
  const selectFromMock = vi.fn(() => ({ where: selectWhereMock }));
  const deleteWhereMock = vi.fn();

  return {
    requireOwnerMock: vi.fn(),
    insertValuesMock,
    insertMock: vi.fn(() => ({ values: insertValuesMock })),
    selectLimitMock,
    selectWhereMock,
    selectFromMock,
    selectMock: vi.fn(() => ({ from: selectFromMock })),
    deleteWhereMock,
    deleteMock: vi.fn(() => ({ where: deleteWhereMock })),
    uploadMediaObjectMock: vi.fn(),
    deleteMediaObjectMock: vi.fn(),
    listMediaAssetsForEditorMock: vi.fn(),
    validateImageUploadMock: vi.fn(),
  };
});

vi.mock("@/lib/authz", () => ({
  requireOwner: requireOwnerMock,
}));

vi.mock("@/db", () => ({
  db: {
    insert: insertMock,
    select: selectMock,
    delete: deleteMock,
  },
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("@/lib/media-storage", () => ({
  uploadMediaObject: uploadMediaObjectMock,
  deleteMediaObject: deleteMediaObjectMock,
}));

vi.mock("@/lib/media-assets", () => ({
  listMediaAssetsForEditor: listMediaAssetsForEditorMock,
  validateImageUpload: validateImageUploadMock,
}));

import { deleteArticleImage, uploadArticleImage, type MediaAssetActionState } from "../actions";

function emptyState(): MediaAssetActionState {
  return { assets: [] };
}

beforeEach(() => {
  requireOwnerMock.mockReset();
  insertValuesMock.mockReset();
  insertMock.mockClear();
  selectLimitMock.mockReset();
  selectWhereMock.mockClear();
  selectFromMock.mockClear();
  selectMock.mockClear();
  deleteWhereMock.mockReset();
  deleteMock.mockClear();
  uploadMediaObjectMock.mockReset();
  deleteMediaObjectMock.mockReset();
  listMediaAssetsForEditorMock.mockReset();
  validateImageUploadMock.mockReset();
});

describe("uploadArticleImage", () => {
  it("rejects non-owner uploads before storage or database writes", async () => {
    requireOwnerMock.mockRejectedValueOnce(new Error("Forbidden"));

    const formData = new FormData();
    formData.set("file", new File(["demo"], "cover.png", { type: "image/png" }));

    await expect(uploadArticleImage(null, emptyState(), formData)).rejects.toThrow("Forbidden");
    expect(uploadMediaObjectMock).not.toHaveBeenCalled();
    expect(insertMock).not.toHaveBeenCalled();
  });

  it("stores uploaded asset metadata and returns the refreshed asset list", async () => {
    requireOwnerMock.mockResolvedValue(undefined);
    uploadMediaObjectMock.mockResolvedValue({
      bucket: "personalweb-images",
      objectPath: "articles/12/demo.png",
      publicUrl: "https://example.com/demo.png",
    });
    listMediaAssetsForEditorMock.mockResolvedValue([{ id: 7, publicUrl: "https://example.com/demo.png" }]);

    const formData = new FormData();
    formData.set("file", new File(["demo"], "cover.png", { type: "image/png" }));
    formData.set("altText", "Demo image");

    const result = await uploadArticleImage(12, emptyState(), formData);

    expect(validateImageUploadMock).toHaveBeenCalledTimes(1);
    expect(uploadMediaObjectMock).toHaveBeenCalledTimes(1);
    expect(insertValuesMock).toHaveBeenCalledWith(
      expect.objectContaining({
        articleId: 12,
        bucket: "personalweb-images",
        objectPath: "articles/12/demo.png",
        publicUrl: "https://example.com/demo.png",
        mimeType: "image/png",
        altText: "Demo image",
      }),
    );
    expect(result).toEqual(
      expect.objectContaining({
        assets: [{ id: 7, publicUrl: "https://example.com/demo.png" }],
        success: "Image uploaded",
      }),
    );
  });
});

describe("deleteArticleImage", () => {
  it("deletes the remote object before deleting the database record", async () => {
    requireOwnerMock.mockResolvedValue(undefined);
    selectLimitMock.mockResolvedValue([
      { id: 9, bucket: "personalweb-images", objectPath: "articles/9/demo.png" },
    ]);
    listMediaAssetsForEditorMock.mockResolvedValue([]);

    const formData = new FormData();
    formData.set("assetId", "9");

    const result = await deleteArticleImage(9, emptyState(), formData);

    expect(deleteMediaObjectMock).toHaveBeenCalledWith({
      bucket: "personalweb-images",
      objectPath: "articles/9/demo.png",
    });
    expect(deleteMock).toHaveBeenCalledTimes(1);
    expect(deleteWhereMock).toHaveBeenCalledTimes(1);
    expect(result).toEqual(expect.objectContaining({ success: "Image deleted" }));
  });

  it("keeps the media asset record when remote deletion fails", async () => {
    requireOwnerMock.mockResolvedValue(undefined);
    selectLimitMock.mockResolvedValue([
      { id: 9, bucket: "personalweb-images", objectPath: "articles/9/demo.png" },
    ]);
    deleteMediaObjectMock.mockRejectedValueOnce(new Error("Supabase delete failed"));
    listMediaAssetsForEditorMock.mockResolvedValue([{ id: 9, publicUrl: "https://example.com/demo.png" }]);

    const formData = new FormData();
    formData.set("assetId", "9");

    const result = await deleteArticleImage(9, emptyState(), formData);

    expect(deleteWhereMock).not.toHaveBeenCalled();
    expect(result).toEqual(
      expect.objectContaining({
        assets: [{ id: 9, publicUrl: "https://example.com/demo.png" }],
        error: "Supabase delete failed",
      }),
    );
  });
});
