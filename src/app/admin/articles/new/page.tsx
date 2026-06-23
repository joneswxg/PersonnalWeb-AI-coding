import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MarkdownEditor } from "@/components/markdown-editor";
import { listCategories } from "@/lib/article-queries";
import { createArticle } from "../actions";

export default async function NewArticlePage() {
  const categoryList = await listCategories();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">New article</h1>
      <form action={createArticle} className="space-y-4">
        <div className="space-y-1">
          <Label htmlFor="title">Title</Label>
          <Input id="title" name="title" required />
        </div>
        <div className="space-y-1">
          <Label htmlFor="categoryId">Category</Label>
          <Select name="categoryId" required>
            <SelectTrigger id="categoryId" className="w-full">
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {categoryList.map((category) => (
                <SelectItem key={category.id} value={String(category.id)}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
