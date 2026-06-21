import { getRole } from "@/lib/roles";
import { listArticlesForRole, listCategories, listTags } from "@/lib/article-queries";
import { ArticleCard } from "@/components/article-card";
import { CategoryTagNav } from "@/components/category-tag-nav";

export default async function HomePage() {
  const role = await getRole();
  const [articleList, categoryList, tagList] = await Promise.all([
    listArticlesForRole(role),
    listCategories(),
    listTags(),
  ]);

  return (
    <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 px-4 py-8 md:grid-cols-[200px_1fr]">
      <CategoryTagNav categories={categoryList} tags={tagList} />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {articleList.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
        {articleList.length === 0 && (
          <p className="text-muted-foreground col-span-full py-12 text-center">
            No articles here yet.
          </p>
        )}
      </div>
    </div>
  );
}
