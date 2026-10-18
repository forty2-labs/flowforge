"use client";

import { ROLE_LABELS, type WorkspaceDto } from "@flowforge/types";
import { Avatar } from "@flowforge/ui";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export function WorkspaceSwitcher({
  current,
  workspaces,
}: {
  current: WorkspaceDto;
  workspaces: WorkspaceDto[];
}) {
  const [open, setOpen] = useState(false);
  const container = useRef<HTMLDivElement>(null);
  // Switching keeps you on the same section: Team stays Team.
  const section = usePathname().split("/")[3];

  useEffect(() => {
    if (!open) return;
    const close = (event: MouseEvent | KeyboardEvent) => {
      if (event instanceof KeyboardEvent) {
        if (event.key === "Escape") setOpen(false);
      } else if (!container.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", close);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", close);
    };
  }, [open]);

  return (
    <div ref={container} className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-controls="workspace-switcher-list"
        aria-label={`Switch workspace. Current: ${current.name}`}
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center gap-2.5 rounded-lg border border-line-on-ink bg-sidebar-raised px-2.5 py-2 text-left text-white"
      >
        <Avatar name={current.name} shape="square" className="h-[30px] w-[30px]" />
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-label font-semibold">{current.name}</span>
          <span className="text-helper text-on-ink-muted">{ROLE_LABELS[current.role]}</span>
        </span>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          className="text-icon-on-ink"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M8 9l4-4 4 4M8 15l4 4 4-4" />
        </svg>
      </button>

      {open && (
        <div
          id="workspace-switcher-list"
          className="absolute top-full right-0 left-0 z-10 mt-1.5 flex flex-col gap-0.5 rounded-lg border border-line bg-surface p-1.5 text-fg shadow-menu"
        >
          <ul className="flex flex-col gap-0.5">
            {workspaces.map((workspace) => {
              const isCurrent = workspace.slug === current.slug;
              return (
                <li key={workspace.id}>
                  <Link
                    href={`/w/${workspace.slug}${section ? `/${section}` : ""}`}
                    aria-current={isCurrent ? "true" : undefined}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-2.5 rounded-md px-2 py-1.5 text-fg hover:bg-sunken hover:text-fg ${isCurrent ? "bg-primary-soft" : ""}`}
                  >
                    <Avatar name={workspace.name} shape="square" className="h-7 w-7" />
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate text-label font-medium">{workspace.name}</span>
                      <span className="text-helper text-fg-muted">{ROLE_LABELS[workspace.role]}</span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
          <div className="my-1 h-px bg-line" />
          <Link
            href="/workspaces/new"
            onClick={() => setOpen(false)}
            className="rounded-md px-2 py-1.5 text-label font-medium hover:bg-sunken"
          >
            Create workspace
          </Link>
        </div>
      )}
    </div>
  );
}
