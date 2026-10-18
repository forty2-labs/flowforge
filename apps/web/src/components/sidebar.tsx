import type { SessionDto, WorkspaceDto } from "@flowforge/types";
import { Avatar, Wordmark } from "@flowforge/ui";
import Link from "next/link";
import { signOut } from "@/lib/actions/auth";
import { MobileNav } from "./mobile-nav";
import { NavLink } from "./nav-link";
import { WorkspaceSwitcher } from "./workspace-switcher";

const ICONS = {
  overview: "M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z",
  team: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8",
  settings:
    "M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6",
};

// From the md breakpoint the navigation is a sticky sidebar. Below it, a top
// bar opens the same navigation in a drawer, so phones see the page first.
export function Sidebar({
  session,
  workspace,
}: {
  session: SessionDto;
  workspace: WorkspaceDto;
}) {
  return (
    <>
      <MobileNav workspace={workspace}>
        <SidebarContent session={session} workspace={workspace} />
      </MobileNav>
      <nav
        aria-label="Main"
        data-surface="ink"
        className="sticky top-0 hidden h-screen w-(--ff-sidebar-width) flex-none overflow-y-auto bg-sidebar px-3.5 pt-4 pb-5 text-on-ink md:flex md:flex-col"
      >
        <SidebarContent session={session} workspace={workspace} />
      </nav>
    </>
  );
}

function SidebarContent({
  session,
  workspace,
}: {
  session: SessionDto;
  workspace: WorkspaceDto;
}) {
  const base = `/w/${workspace.slug}`;
  return (
    <div className="flex flex-1 flex-col gap-4">
      <Link href={base} className="self-start rounded-md px-1 py-0.5 text-white hover:text-white">
        <Wordmark />
      </Link>

      <WorkspaceSwitcher current={workspace} workspaces={session.workspaces} />

      <div className="flex flex-col gap-3.5">
        <NavLink href={base} exact icon={ICONS.overview}>
          Overview
        </NavLink>
        <div className="flex flex-col gap-0.5">
          <span className="px-2.5 pb-1 text-helper font-medium text-on-ink-subtle">
            Workspace
          </span>
          <NavLink href={`${base}/team`} icon={ICONS.team}>
            Team
          </NavLink>
          <NavLink href={`${base}/settings`} icon={ICONS.settings}>
            Settings
          </NavLink>
        </div>
      </div>

      <div className="mt-auto flex flex-col gap-3">
        <div className="h-px bg-line-on-ink-subtle" />
        <div className="flex items-center gap-2.5 px-1.5 py-1">
          <Avatar name={session.user.name} />
          <span className="flex min-w-0 flex-1 flex-col">
            <span className="truncate text-label font-medium text-white">
              {session.user.name}
            </span>
            <span className="truncate text-helper text-on-ink-muted">
              {session.user.email}
            </span>
          </span>
          <form action={signOut}>
            <button
              type="submit"
              className="rounded-md px-2 py-1.5 text-helper font-medium text-on-ink hover:bg-sidebar-active hover:text-white pointer-coarse:min-h-11"
            >
              Sign out
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
