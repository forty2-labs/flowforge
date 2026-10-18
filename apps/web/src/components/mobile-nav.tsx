"use client";

import type { WorkspaceDto } from "@flowforge/types";
import { LogoMark } from "@flowforge/ui";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";

// The phone top bar. The menu opens the sidebar's content in a drawer built
// on the native <dialog>, which traps focus, closes on Esc and returns focus
// to the menu button.
export function MobileNav({
  workspace,
  children,
}: {
  workspace: WorkspaceDto;
  children: ReactNode;
}) {
  // The drawer is open on the page it was opened from, so following a link
  // inside it closes it.
  const pathname = usePathname();
  const [openOn, setOpenOn] = useState<string | null>(null);
  const open = openOn === pathname;
  const setOpen = (value: boolean) => setOpenOn(value ? pathname : null);
  const drawer = useRef<HTMLDialogElement>(null);
  const drawerId = useId();

  useEffect(() => {
    const dialog = drawer.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <div
      data-surface="ink"
      className="sticky top-0 z-30 flex h-(--ff-topbar-height) items-center gap-3 bg-sidebar px-2 text-white md:hidden"
    >
      <button
        type="button"
        aria-label="Menu"
        aria-expanded={open}
        aria-controls={drawerId}
        onClick={() => setOpen(true)}
        className="inline-flex h-11 w-11 flex-none items-center justify-center rounded-md text-on-ink hover:bg-sidebar-active hover:text-white"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          <path d="M4 7h16M4 12h16M4 17h10" />
        </svg>
      </button>
      <Link
        href={`/w/${workspace.slug}`}
        className="flex min-w-0 items-center gap-2.5 rounded-md py-1 text-white hover:text-white"
      >
        <LogoMark size={26} />
        <span className="truncate text-title">{workspace.name}</span>
      </Link>

      <dialog
        ref={drawer}
        id={drawerId}
        aria-label="Menu"
        onClose={() => setOpen(false)}
        onClick={(event) => {
          if (event.target === event.currentTarget) setOpen(false);
        }}
        className="ff-drawer m-0 h-dvh max-h-none w-[min(20rem,85vw)] max-w-none bg-sidebar p-0 text-on-ink backdrop:bg-ink/45"
      >
        <div data-surface="ink" className="flex min-h-full flex-col px-3.5 pt-3 pb-5">
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="mb-1 inline-flex h-11 w-11 items-center justify-center self-end rounded-md text-on-ink hover:bg-sidebar-active hover:text-white"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
          <nav aria-label="Main" className="flex flex-1 flex-col">
            {children}
          </nav>
        </div>
      </dialog>
    </div>
  );
}
