import Link from "next/link";

export function CategoryTagNav({
  categories,
  tags,
}: {
  categories: { name: string; slug: string }[];
  tags: { name: string; slug: string }[];
}) {
  return (
    <aside className="space-y-6">
      <div>
        <h2 className="text-muted-foreground mb-2 text-xs font-semibold uppercase tracking-wide">
          Categories
        </h2>
        <ul className="space-y-1 text-sm">
          {categories.map((category) => (
            <li key={category.slug}>
              <Link
                href={`/categories/${category.slug}`}
                className="hover:underline"
              >
                {category.name}
              </Link>
            </li>
          ))}
          {categories.length === 0 && (
            <li className="text-muted-foreground">None yet</li>
          )}
        </ul>
      </div>
      <div>
        <h2 className="text-muted-foreground mb-2 text-xs font-semibold uppercase tracking-wide">
          Tags
        </h2>
        <ul className="flex flex-wrap gap-2 text-sm">
          {tags.map((tag) => (
            <li key={tag.slug}>
              <Link href={`/tags/${tag.slug}`} className="hover:underline">
                #{tag.name}
              </Link>
            </li>
          ))}
          {tags.length === 0 && <li className="text-muted-foreground">None yet</li>}
        </ul>
      </div>
    </aside>
  );
}
