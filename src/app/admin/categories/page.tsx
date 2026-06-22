import { listCategoriesWithArticleCount } from "@/lib/categories";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ConfirmDeleteDialog } from "@/components/confirm-delete-dialog";
import { createCategory, renameCategory, deleteCategory } from "./actions";

export default async function CategoriesPage() {
  const categoryList = await listCategoriesWithArticleCount();
  const canDelete = categoryList.length > 1;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Categories</h1>

      <Card>
        <CardHeader>
          <CardTitle>Add a category</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createCategory} className="flex items-end gap-3">
            <div className="flex-1 space-y-1">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" placeholder="e.g. Rust" required />
            </div>
            <Button type="submit">Add</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All categories</CardTitle>
        </CardHeader>
        <CardContent>
          {categoryList.length === 0 ? (
            <p className="text-muted-foreground text-sm">No categories yet.</p>
          ) : (
            <ul className="divide-y">
              {categoryList.map((category) => {
                const migrationTargets = categoryList.filter((c) => c.id !== category.id);
                return (
                  <li key={category.id} className="flex items-center justify-between gap-4 py-3">
                    <form
                      action={renameCategory.bind(null, category.id)}
                      className="flex flex-1 items-center gap-2"
                    >
                      <Input name="name" defaultValue={category.name} className="max-w-xs" />
                      <Button type="submit" variant="outline" size="sm">
                        Rename
                      </Button>
                    </form>
                    <span className="text-muted-foreground text-xs whitespace-nowrap">
                      {category.articleCount} article{category.articleCount === 1 ? "" : "s"}
                    </span>
                    {canDelete ? (
                      <ConfirmDeleteDialog
                        triggerLabel="Delete"
                        title={`Delete "${category.name}"?`}
                        description="Choose where its articles should go. They will be moved to the selected category."
                        formAction={deleteCategory.bind(null, category.id)}
                      >
                        <div className="space-y-1">
                          <Label htmlFor={`migrate-${category.id}`}>Move articles to</Label>
                          <Select name="migrateToCategoryId" required>
                            <SelectTrigger id={`migrate-${category.id}`} className="w-full">
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                            <SelectContent>
                              {migrationTargets.map((target) => (
                                <SelectItem key={target.id} value={String(target.id)}>
                                  {target.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </ConfirmDeleteDialog>
                    ) : (
                      <Button variant="destructive" size="sm" disabled>
                        Delete
                      </Button>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
