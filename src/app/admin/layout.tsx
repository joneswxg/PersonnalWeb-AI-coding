import { redirect } from "next/navigation";
import { getRole } from "@/lib/roles";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const role = await getRole();
  if (role !== "owner") {
    redirect("/");
  }

  return <div className="mx-auto max-w-3xl px-4 py-8">{children}</div>;
}
