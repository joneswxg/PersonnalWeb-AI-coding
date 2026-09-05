import Link from "next/link";
import { getRole } from "@/lib/roles";
import { AuthButtons } from "@/components/auth-buttons";

export async function SiteHeader() {
  const role = await getRole();

  return (
    <header className="border-b border-stone-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-4 sm:px-8">
        <Link href="/" className="text-lg font-semibold">
          joneswxg
        </Link>
        <nav className="flex flex-wrap items-center justify-end gap-x-4 gap-y-2 text-sm">
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
