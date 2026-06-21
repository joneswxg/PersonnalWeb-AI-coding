import { notFound } from "next/navigation";
import { getRole } from "@/lib/roles";
import { listArticlesForRole, listCategories, listTags } from "@/lib/article-queries";
import { ArticleCard } from "@/components/article-card";
import { CategoryTagNav } from "@/components/category-tag-nav";

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const role = await getRole();
  const [articleList, categoryList, tagList] = await Promise.all([
    listArticlesForRole(role, { categorySlug: slug }),
    listCategories(),
    listTags(),
  ]);

  const category = categoryList.find((c) => c.slug === slug);
  if (!category) {
    notFound();
  }

  return (
    <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 px-4 py-8 md:grid-cols-[200px_1fr]">
      <CategoryTagNav categories={categoryList} tags={tagList} />
      <div>
        <h1 className="mb-4 text-xl font-semibold">{category.name}</h1>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {articleList.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
          {articleList.length === 0 && (
            <p className="text-muted-foreground col-span-full py-12 text-center">
              No articles in this category yet.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
