import { desc, eq, isNull, or } from "drizzle-orm";
import { db } from "@/db";
import { mediaAssets } from "@/db/schema";
export {
  ACCEPTED_IMAGE_MIME_TYPES,
  MAX_IMAGE_FILE_SIZE_BYTES,
  validateImageUpload,
} from "@/lib/media-asset-utils";

export type MediaAssetListItem = {
  id: number;
  articleId: number | null;
  bucket: string;
  objectPath: string;
  publicUrl: string;
  mimeType: string;
  sizeBytes: number;
  altText: string | null;
};

export async function listMediaAssetsForEditor(
  articleId: number | null,
): Promise<MediaAssetListItem[]> {
  const whereClause =
    articleId === null
      ? isNull(mediaAssets.articleId)
      : or(eq(mediaAssets.articleId, articleId), isNull(mediaAssets.articleId));

  return db
    .select({
      id: mediaAssets.id,
      articleId: mediaAssets.articleId,
      bucket: mediaAssets.bucket,
      objectPath: mediaAssets.objectPath,
      publicUrl: mediaAssets.publicUrl,
      mimeType: mediaAssets.mimeType,
      sizeBytes: mediaAssets.sizeBytes,
      altText: mediaAssets.altText,
    })
    .from(mediaAssets)
    .where(whereClause)
    .orderBy(desc(mediaAssets.createdAt));
}
