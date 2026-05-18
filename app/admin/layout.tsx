import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import Link from "next/link";
import { signOut } from "@/lib/auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user?.tenantId) {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <nav className="border-b border-white/10 bg-[#0a0a0f]/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-6">
            <Link
              href="/admin/leads"
              className="text-sm font-semibold text-white/90 hover:text-white"
            >
              SWN AI Admin
            </Link>
            <div className="flex gap-4">
              <NavLink href="/admin/leads">Leads</NavLink>
              <NavLink href="/admin/queue">Queue</NavLink>
              <NavLink href="/admin/config">Config</NavLink>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-white/40">{session.user.email}</span>
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/admin/login" });
              }}
            >
              <button
                type="submit"
                className="text-xs text-white/50 hover:text-white transition-colors"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </nav>
      <main className="mx-auto max-w-7xl px-4 py-8">{children}</main>
    </div>
  );
}

function NavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="text-sm text-white/60 hover:text-white transition-colors"
    >
      {children}
    </Link>
  );
}
