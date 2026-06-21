import Link from "next/link";
import { notFound } from "next/navigation";
import { getRole } from "@/lib/roles";
import { getArticleBySlugForRole } from "@/lib/article-queries";
import { Badge } from "@/components/ui/badge";
import { MarkdownContent } from "@/components/markdown-content";

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const role = await getRole();
  const article = await getArticleBySlugForRole(slug, role);

  if (!article) {
    notFound();
  }

  return (
    <article className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-4 flex items-center gap-2">
        {article.categorySlug && (
          <Link
            href={`/categories/${article.categorySlug}`}
            className="text-muted-foreground text-sm hover:underline"
          >
            {article.categoryName}
          </Link>
        )}
        {article.status !== "public" && (
          <Badge variant="secondary">{article.status}</Badge>
        )}
      </div>
      <h1 className="mb-2 text-3xl font-semibold">{article.title}</h1>
      <p className="text-muted-foreground mb-6 text-sm">
        Updated {article.updatedAt.toLocaleDateString()}
      </p>
      <MarkdownContent content={article.content} />
      <div className="mt-8 flex flex-wrap gap-2">
        {article.tags.map((tag) => (
          <Badge
            key={tag.slug}
            variant="outline"
            render={<Link href={`/tags/${tag.slug}`}>#{tag.name}</Link>}
          />
        ))}
      </div>
    </article>
  );
}
