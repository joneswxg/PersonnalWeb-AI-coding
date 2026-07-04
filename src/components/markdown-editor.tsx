"use client";

import { useActionState, useState } from "react";
import { ImagePlus, Trash2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MarkdownContent } from "@/components/markdown-content";
import { buildMarkdownImage, formatFileSize } from "@/lib/media-asset-utils";
import {
  type MediaAssetListItem,
} from "@/lib/media-assets";
import type { MediaAssetActionState } from "@/app/admin/articles/actions";

export function MarkdownEditor({
  name,
  defaultValue = "",
  formId,
  mediaAssets,
  uploadImageAction,
  deleteImageAction,
}: {
  name: string;
  defaultValue?: string;
  formId: string;
  mediaAssets: MediaAssetListItem[];
  uploadImageAction: (
    state: MediaAssetActionState,
    formData: FormData,
  ) => Promise<MediaAssetActionState>;
  deleteImageAction: (
    state: MediaAssetActionState,
    formData: FormData,
  ) => Promise<MediaAssetActionState>;
}) {
  const [content, setContent] = useState(defaultValue);
  const [uploadState, uploadFormAction, uploadPending] = useActionState(uploadImageAction, {
    assets: mediaAssets,
  });
  const [deleteState, deleteFormAction, deletePending] = useActionState(deleteImageAction, {
    assets: mediaAssets,
  });
  const [activeAssetAction, setActiveAssetAction] = useState<"upload" | "delete" | null>(null);
  const assets =
    activeAssetAction === "delete"
      ? deleteState.assets
      : activeAssetAction === "upload"
        ? uploadState.assets
        : mediaAssets;
  const feedbackMessage =
    activeAssetAction === "delete"
      ? deleteState.error ?? deleteState.success
      : activeAssetAction === "upload"
        ? uploadState.error ?? uploadState.success
        : undefined;

  function insertAsset(asset: MediaAssetListItem) {
    const snippet = buildMarkdownImage(asset);
    setContent((current) => (current.trim().length === 0 ? snippet : `${current}\n\n${snippet}`));
  }

  return (
    <div className="space-y-4">
      <Label htmlFor={name}>Content (Markdown)</Label>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Textarea
            id={name}
            name={name}
            form={formId}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onDragOver={(e) => {
              if (e.dataTransfer.types.includes("Files")) {
                e.preventDefault();
              }
            }}
            onDrop={(e) => {
              if (e.dataTransfer.files.length > 0) {
                e.preventDefault();
              }
            }}
            className="min-h-[420px] font-mono text-sm"
            placeholder="# Today I learned..."
          />
          <div className="min-h-[420px] overflow-y-auto rounded-md border p-4">
            {content.trim() ? (
              <MarkdownContent content={content} />
            ) : (
              <p className="text-muted-foreground">Preview will appear here.</p>
            )}
          </div>
        </div>
        <aside className="space-y-4 rounded-md border p-4">
          <div className="space-y-1">
            <h2 className="text-sm font-semibold">Images</h2>
            <p className="text-muted-foreground text-sm">
              JPEG, PNG, WebP. Up to 10 MB.
            </p>
          </div>

          <form action={uploadFormAction} className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor={`${name}-image-file`}>Image file</Label>
              <Input
                id={`${name}-image-file`}
                name="file"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                required
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor={`${name}-image-alt`}>Alt text</Label>
              <Input id={`${name}-image-alt`} name="altText" placeholder="Optional description" />
            </div>
            <Button
              type="submit"
              size="sm"
              disabled={uploadPending}
              className="w-full"
              onClick={() => setActiveAssetAction("upload")}
            >
              <ImagePlus className="size-4" />
              Upload image
            </Button>
          </form>

          {feedbackMessage ? (
            <p className="text-sm text-muted-foreground">{feedbackMessage}</p>
          ) : null}

          <div className="space-y-3">
            {assets.length > 0 ? (
              assets.map((asset) => (
                <div key={asset.id} className="space-y-2 rounded-md border p-3">
                  <div className="space-y-1">
                    <p className="truncate text-sm font-medium">{asset.objectPath.split("/").at(-1)}</p>
                    <p className="text-muted-foreground text-xs">
                      {formatFileSize(asset.sizeBytes)} · {asset.mimeType}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {asset.altText?.trim() || "No alt text"}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button type="button" size="sm" onClick={() => insertAsset(asset)}>
                      Insert
                    </Button>
                    <form action={deleteFormAction} className="flex-1">
                      <input type="hidden" name="assetId" value={asset.id} />
                      <Button
                        type="submit"
                        size="sm"
                        variant="outline"
                        disabled={deletePending}
                        className="w-full"
                        onClick={() => setActiveAssetAction("delete")}
                      >
                        <Trash2 className="size-4" />
                        Delete
                      </Button>
                    </form>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-sm">No uploaded images yet.</p>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
