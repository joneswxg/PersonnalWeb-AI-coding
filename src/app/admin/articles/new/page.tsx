import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MarkdownEditor } from "@/components/markdown-editor";
import { createArticle } from "../actions";

export default function NewArticlePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">New article</h1>
      <form action={createArticle} className="space-y-4">
        <div className="space-y-1">
          <Label htmlFor="title">Title</Label>
          <Input id="title" name="title" required />
        </div>
        <div className="space-y-1">
          <Label htmlFor="categoryName">Category</Label>
          <Input
            id="categoryName"
            name="categoryName"
            placeholder="e.g. Rust"
            required
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="tags">Tags (comma-separated)</Label>
          <Input id="tags" name="tags" placeholder="e.g. async, tokio" />
        </div>
        <MarkdownEditor name="content" />
        <p className="text-muted-foreground text-sm">
          Saves as a draft. You can publish it from the edit page.
        </p>
        <Button type="submit">Create draft</Button>
      </form>
    </div>
  );
}
