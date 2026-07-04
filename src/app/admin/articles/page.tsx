import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ConfirmDeleteDialog } from "@/components/confirm-delete-dialog";
import { deleteArticle } from "./actions";
import { listAdminArticles } from "@/lib/admin-articles";
import { listCategoriesWithArticleCount } from "@/lib/categories";
import { isArticleStatus } from "@/lib/articles";
import type { ArticleStatus } from "@/db/schema";

export default async function AdminArticlesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; categoryId?: string; q?: string }>;
}) {
  const { status, categoryId, q } = await searchParams;
  const statusFilter: ArticleStatus | undefined =
    status && isArticleStatus(status) ? status : undefined;
  const categoryIdFilter = categoryId ? Number(categoryId) : undefined;

  const [rows, categoryList] = await Promise.all([
    listAdminArticles({ status: statusFilter, categoryId: categoryIdFilter, titleSearch: q }),
    listCategoriesWithArticleCount(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Article Management</h1>
        <Button nativeButton={false} render={<Link href="/admin/articles/new">New article</Link>} />
      </div>

      <form method="get" className="flex flex-wrap items-end gap-3">
        <Input
          name="q"
          defaultValue={q}
          placeholder="Search by title"
          className="max-w-xs"
        />
        <Select name="status" defaultValue={statusFilter}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Any status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="draft">draft</SelectItem>
            <SelectItem value="private">private</SelectItem>
            <SelectItem value="public">public</SelectItem>
          </SelectContent>
        </Select>
        <Select name="categoryId" defaultValue={categoryId}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Any category" />
          </SelectTrigger>
          <SelectContent>
            {categoryList.map((category) => (
              <SelectItem key={category.id} value={String(category.id)}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button type="submit" variant="outline">
          Filter
        </Button>
        {(status || categoryId || q) && (
          <Button
            nativeButton={false}
            render={<Link href="/admin/articles">Clear</Link>}
            variant="ghost"
          />
        )}
      </form>

      <ul className="divide-y">
        {rows.map((row) => (
          <li key={row.id} className="flex items-center justify-between py-3">
            <div className="space-y-1">
              <Link
                href={`/admin/articles/${row.id}/edit`}
                className="font-medium hover:underline"
              >
                {row.title}
              </Link>
              <div className="text-muted-foreground text-xs">
                {row.categoryName ?? "Uncategorized"} ·{" "}
                {row.updatedAt.toLocaleDateString()}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant={row.status === "public" ? "default" : "secondary"}>
                {row.status}
              </Badge>
              <ConfirmDeleteDialog
                triggerLabel="Delete"
                title={`Delete "${row.title}"?`}
                description="This permanently deletes the article and its tags. This cannot be undone."
                formAction={deleteArticle.bind(null, row.id)}
              />
            </div>
          </li>
        ))}
        {rows.length === 0 && (
          <p className="text-muted-foreground py-6 text-sm">
            No articles match these filters.
          </p>
        )}
      </ul>
    </div>
  );
}
