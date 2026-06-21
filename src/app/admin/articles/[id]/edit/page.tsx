import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { articles, categories } from "@/db/schema";
import { getAllTagsForArticles } from "@/lib/articles";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MarkdownEditor } from "@/components/markdown-editor";
import { updateArticle, setArticleStatus } from "../../actions";
import type { ArticleStatus } from "@/db/schema";

const STATUSES: ArticleStatus[] = ["draft", "private", "public"];

export default async function EditArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const articleId = Number(id);
  if (!Number.isInteger(articleId)) {
    notFound();
  }

  const [article] = await db
    .select({
      id: articles.id,
      title: articles.title,
      content: articles.content,
      status: articles.status,
      categoryName: categories.name,
    })
    .from(articles)
    .leftJoin(categories, eq(articles.categoryId, categories.id))
    .where(eq(articles.id, articleId))
    .limit(1);

  if (!article) {
    notFound();
  }

  const tagsByArticle = await getAllTagsForArticles([articleId]);
  const tagsValue = (tagsByArticle.get(articleId) ?? []).map((t) => t.name).join(", ");

  const updateArticleWithId = updateArticle.bind(null, articleId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Edit article</h1>
        <Badge variant={article.status === "public" ? "default" : "secondary"}>
          {article.status}
        </Badge>
      </div>

      <div className="flex gap-2">
        {STATUSES.map((status) => (
          <form key={status} action={setArticleStatus.bind(null, articleId, status)}>
            <Button
              type="submit"
              variant={article.status === status ? "default" : "outline"}
              size="sm"
              disabled={article.status === status}
            >
              Set {status}
            </Button>
          </form>
        ))}
      </div>

      <form action={updateArticleWithId} className="space-y-4">
        <div className="space-y-1">
          <Label htmlFor="title">Title</Label>
          <Input id="title" name="title" defaultValue={article.title} required />
        </div>
        <div className="space-y-1">
          <Label htmlFor="categoryName">Category</Label>
          <Input
            id="categoryName"
            name="categoryName"
            defaultValue={article.categoryName ?? ""}
            required
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="tags">Tags (comma-separated)</Label>
          <Input id="tags" name="tags" defaultValue={tagsValue} />
        </div>
        <MarkdownEditor name="content" defaultValue={article.content} />
        <Button type="submit">Save changes</Button>
      </form>
    </div>
  );
}
