import { AppSidebar } from "@/components/app-sidebar";
import { AppTopbar } from "@/components/app-topbar";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getServerConfiguration } from "@/lib/server-config";

// Prisma Compute injects project env vars at runtime. Never prerender an auth/
// database-protected route while those values are unavailable to the build.
export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  if (!getServerConfiguration().ready) redirect("/setup");
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[272px] border-r border-border lg:block">
        <AppSidebar />
      </aside>
      <div className="lg:pl-[272px]">
        <AppTopbar />
        <main className="mx-auto w-full max-w-[1600px] p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
