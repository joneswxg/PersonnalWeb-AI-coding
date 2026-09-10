import Link from "next/link";
import { getRole } from "@/lib/roles";
import { AuthButtons } from "@/components/auth-buttons";

export async function SiteHeader() {
  const role = await getRole();

  return (
    <header className="border-b border-black bg-white">
      <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-4 px-5 py-5 sm:px-8 lg:px-10">
        <Link href="/" className="font-display text-xl font-semibold tracking-[0.08em] text-black uppercase">
          joneswxg
        </Link>
        <nav className="flex flex-wrap items-center justify-end gap-x-5 gap-y-2 text-sm font-medium tracking-[0.08em] text-black uppercase">
          <Link href="/" className="text-black hover:text-stone-700">
            Portfolio
          </Link>
          <Link href="/projects" className="text-black hover:text-stone-700">
            Projects
          </Link>
          <Link href="/journal" className="text-black hover:text-stone-700">
            Technical Journal
          </Link>
          <Link href="/search" className="text-black hover:text-stone-700">
            Search
          </Link>
          {role === "owner" && (
            <>
              <Link href="/admin/articles" className="text-black hover:text-stone-700">
                Article Management
              </Link>
              <Link
                href="/admin/categories"
                className="text-black hover:text-stone-700"
              >
                Categories
              </Link>
              <Link
                href="/admin/trusted-users"
                className="text-black hover:text-stone-700"
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
