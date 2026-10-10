import { Suspense } from "react";
import { Sidebar } from "@/components/sidebar";
import { requireWorkspace } from "@/lib/session";

export default function WorkspaceLayout({
  children,
  params,
}: LayoutProps<"/w/[workspaceSlug]">) {
  return (
    <div className="flex min-h-screen flex-1 flex-col md:flex-row">
      <Suspense fallback={<SidebarFallback />}>
        <WorkspaceSidebar params={params} />
      </Suspense>
      <main className="min-w-0 flex-1 px-4 py-8 md:px-8">
        <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-6">
          {children}
        </div>
      </main>
    </div>
  );
}

async function WorkspaceSidebar({
  params,
}: Pick<LayoutProps<"/w/[workspaceSlug]">, "params">) {
  const { workspaceSlug } = await params;
  const { session, workspace } = await requireWorkspace(workspaceSlug);
  return <Sidebar session={session} workspace={workspace} />;
}

function SidebarFallback() {
  return (
    <div
      aria-hidden="true"
      className="h-16 bg-sidebar md:min-h-screen md:w-[var(--ff-sidebar-width)] md:flex-none"
    />
  );
}
