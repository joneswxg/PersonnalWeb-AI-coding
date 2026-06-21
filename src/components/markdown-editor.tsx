"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MarkdownContent } from "@/components/markdown-content";

export function MarkdownEditor({
  name,
  defaultValue = "",
}: {
  name: string;
  defaultValue?: string;
}) {
  const [content, setContent] = useState(defaultValue);

  return (
    <div className="space-y-1">
      <Label htmlFor={name}>Content (Markdown)</Label>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Textarea
          id={name}
          name={name}
          value={content}
          onChange={(e) => setContent(e.target.value)}
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
    </div>
  );
}
