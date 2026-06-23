import Link from "next/link";
import { notFound } from "next/navigation";
import { getRole } from "@/lib/roles";
import { getArticleBySlugForRole, listCategories, listTags } from "@/lib/article-queries";
import { stripDuplicateLeadingHeading } from "@/lib/markdown";
import { Badge } from "@/components/ui/badge";
import { MarkdownContent } from "@/components/markdown-content";
import { CategoryTagNav } from "@/components/category-tag-nav";

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const role = await getRole();
  const [article, categoryList, tagList] = await Promise.all([
    getArticleBySlugForRole(slug, role),
    listCategories(),
    listTags(),
  ]);

  if (!article) {
    notFound();
  }

  return (
    <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 px-4 py-8 md:grid-cols-[200px_1fr]">
      <CategoryTagNav categories={categoryList} tags={tagList} />
      <article className="max-w-3xl">
        {article.status !== "public" && (
          <div className="mb-4">
            <Badge variant="secondary">{article.status}</Badge>
          </div>
        )}
        <h1 className="mb-2 text-3xl font-semibold">{article.title}</h1>
        <p className="text-muted-foreground mb-6 text-sm">
          Updated {article.updatedAt.toLocaleDateString()}
        </p>
        <MarkdownContent
          content={stripDuplicateLeadingHeading(article.content, article.title)}
        />
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
    </div>
  );
}
