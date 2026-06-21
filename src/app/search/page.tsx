import { getRole } from "@/lib/roles";
import { searchArticlesForRole } from "@/lib/article-queries";
import { ArticleCard } from "@/components/article-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";
  const role = await getRole();
  const results = query ? await searchArticlesForRole(query, role) : [];

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <form className="mb-6 flex gap-2" action="/search">
        <Input
          type="search"
          name="q"
          defaultValue={query}
          placeholder="Search articles…"
          className="max-w-sm"
        />
        <Button type="submit">Search</Button>
      </form>

      {query && (
        <p className="text-muted-foreground mb-4 text-sm">
          {results.length} result{results.length === 1 ? "" : "s"} for &ldquo;{query}&rdquo;
        </p>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {results.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>
    </div>
  );
}
