import type { SessionDto, WorkspaceDto } from "@flowforge/types";
import { Wordmark } from "@flowforge/ui";
import Link from "next/link";
import { AccountMenu } from "./account-menu";
import { MobileNav } from "./mobile-nav";
import { NavLink } from "./nav-link";
import { WorkspaceSwitcher } from "./workspace-switcher";

const ICONS = {
  overview: "M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z",
  team: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8",
  settings:
    "M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6",
};

// From the md breakpoint the navigation is a floating glass panel that stays
// in view. Below it, a top bar opens the same navigation in a drawer, so
// phones see the page first.
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
        <SidebarContent session={session} workspace={workspace} inDrawer />
      </MobileNav>
      <nav
        aria-label="Main"
        className="glass sticky top-3 m-3 mr-0 hidden h-[calc(100dvh-1.5rem)] w-(--ff-sidebar-width) flex-none overflow-y-auto rounded-xl px-3 pt-4 pb-3 md:flex md:flex-col"
      >
        <SidebarContent session={session} workspace={workspace} />
      </nav>
    </>
  );
}

function SidebarContent({
  session,
  workspace,
  inDrawer = false,
}: {
  session: SessionDto;
  workspace: WorkspaceDto;
  inDrawer?: boolean;
}) {
  const base = `/w/${workspace.slug}`;
  return (
    <div className="flex flex-1 flex-col gap-4">
      <Link href={base} className="self-start rounded-md px-1 py-0.5 text-fg hover:text-fg">
        <Wordmark />
      </Link>

      <WorkspaceSwitcher current={workspace} workspaces={session.workspaces} />

      <div className="flex flex-col gap-3.5">
        <NavLink href={base} exact icon={ICONS.overview}>
          Overview
        </NavLink>
        <div className="flex flex-col gap-0.5">
          <span className="px-2.5 pb-1 text-helper font-medium text-fg-muted">
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

      <div className="mt-auto flex flex-col gap-2">
        <div className="h-px bg-line" />
        <AccountMenu user={session.user} inline={inDrawer} />
      </div>
    </div>
  );
}
