import Link from "next/link";
import { getRole } from "@/lib/roles";
import { AuthButtons } from "@/components/auth-buttons";

export async function SiteHeader() {
  const role = await getRole();

  return (
    <header className="border-b">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
        <Link href="/" className="text-lg font-semibold">
          joneswxg
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/" className="text-muted-foreground hover:text-foreground">
            Portfolio
          </Link>
          <Link href="/projects" className="text-muted-foreground hover:text-foreground">
            Projects
          </Link>
          <Link href="/journal" className="text-muted-foreground hover:text-foreground">
            Technical Journal
          </Link>
          <Link href="/search" className="text-muted-foreground hover:text-foreground">
            Search
          </Link>
          {role === "owner" && (
            <>
              <Link href="/admin/articles" className="text-muted-foreground hover:text-foreground">
                Article Management
              </Link>
              <Link
                href="/admin/categories"
                className="text-muted-foreground hover:text-foreground"
              >
                Categories
              </Link>
              <Link
                href="/admin/trusted-users"
                className="text-muted-foreground hover:text-foreground"
              >
                Trusted users
              </Link>
            </>
          )}
          <AuthButtons />
        </nav>
      </div>
    </header>
  );
}
