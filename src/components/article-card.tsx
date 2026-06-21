import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ArticleCardData } from "@/lib/article-queries";

export function ArticleCard({ article }: { article: ArticleCardData }) {
  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          {article.categorySlug ? (
            <Link
              href={`/categories/${article.categorySlug}`}
              className="text-muted-foreground text-xs hover:underline"
            >
              {article.categoryName}
            </Link>
          ) : (
            <span />
          )}
          {article.status !== "public" && (
            <Badge variant="secondary">{article.status}</Badge>
          )}
        </div>
        <CardTitle>
          <Link href={`/articles/${article.slug}`} className="hover:underline">
            {article.title}
          </Link>
        </CardTitle>
        <CardDescription>{article.excerpt}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1" />
      <CardFooter className="flex flex-wrap gap-2">
        {article.tags.map((tag) => (
          <Badge
            key={tag.slug}
            variant="outline"
            render={<Link href={`/tags/${tag.slug}`}>#{tag.name}</Link>}
          />
        ))}
      </CardFooter>
    </Card>
  );
}
