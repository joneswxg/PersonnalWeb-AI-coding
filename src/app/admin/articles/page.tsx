import Link from "next/link";
import { desc } from "drizzle-orm";
import { db } from "@/db";
import { articles, categories } from "@/db/schema";
import { eq } from "drizzle-orm";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default async function AdminArticlesPage() {
  const rows = await db
    .select({
      id: articles.id,
      title: articles.title,
      status: articles.status,
      updatedAt: articles.updatedAt,
      categoryName: categories.name,
    })
    .from(articles)
    .leftJoin(categories, eq(articles.categoryId, categories.id))
    .orderBy(desc(articles.updatedAt));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Articles</h1>
        <Button render={<Link href="/admin/articles/new">New article</Link>} />
      </div>

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
            <Badge variant={row.status === "public" ? "default" : "secondary"}>
              {row.status}
            </Badge>
          </li>
        ))}
        {rows.length === 0 && (
          <p className="text-muted-foreground py-6 text-sm">
            No articles yet. Create your first one.
          </p>
        )}
      </ul>
    </div>
  );
}
