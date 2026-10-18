"use client";

import { ROLE_LABELS, type WorkspaceDto } from "@flowforge/types";
import { Avatar, cx } from "@flowforge/ui";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";

// A disclosure of navigation links (ARIA Authoring Practices): the items
// navigate, so they stay links rather than menu items. The list opens in
// place and pushes the navigation down rather than covering it. Opening
// moves focus to the current workspace, arrow keys move between links, and
// Esc closes and returns focus to the button.
export function WorkspaceSwitcher({
  current,
  workspaces,
}: {
  current: WorkspaceDto;
  workspaces: WorkspaceDto[];
}) {
  const [open, setOpen] = useState(false);
  const container = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const listId = useId();
  // Switching keeps you on the same section: Team stays Team.
  const section = usePathname().split("/")[3];

  const links = () =>
    Array.from(container.current?.querySelectorAll<HTMLAnchorElement>("[data-switcher-item]") ?? []);

  const close = (returnFocus: boolean) => {
    setOpen(false);
    if (returnFocus) trigger.current?.focus();
  };

  useEffect(() => {
    if (!open) return;
    const items = Array.from(
      container.current?.querySelectorAll<HTMLAnchorElement>("[data-switcher-item]") ?? [],
    );
    (items.find((link) => link.getAttribute("aria-current")) ?? items[0])?.focus();

    const onPointerDown = (event: PointerEvent) => {
      if (!container.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  const onListKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const items = links();
    const index = items.indexOf(document.activeElement as HTMLAnchorElement);
    const move = (to: number) => {
      event.preventDefault();
      items[(to + items.length) % items.length]?.focus();
    };
    switch (event.key) {
      case "ArrowDown":
        return move(index + 1);
      case "ArrowUp":
        return move(index - 1);
      case "Home":
        return move(0);
      case "End":
        return move(items.length - 1);
      case "Escape":
        event.preventDefault();
        return close(true);
    }
  };

  return (
    <div
      ref={container}
      // Tabbing out of the open list closes it.
      onBlur={(event) => {
        if (open && !container.current?.contains(event.relatedTarget as Node)) setOpen(false);
      }}
    >
      <button
        ref={trigger}
        type="button"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-label={`Switch workspace. Current: ${current.name}`}
        onClick={() => setOpen((value) => !value)}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown" && !open) {
            event.preventDefault();
            setOpen(true);
          }
        }}
        className="flex w-full items-center gap-2.5 rounded-lg border border-line-on-ink bg-sidebar-raised px-2.5 py-2 text-left text-white hover:border-icon-on-ink"
      >
        <Avatar name={current.name} shape="square" className="h-7.5 w-7.5" />
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
          id={listId}
          data-surface="light"
          onKeyDown={onListKeyDown}
          className="mt-1.5 flex flex-col gap-0.5 rounded-lg bg-surface p-1.5 text-fg shadow-menu"
        >
          <ul aria-label="Your workspaces" className="flex flex-col gap-0.5">
            {workspaces.map((workspace) => {
              const isCurrent = workspace.slug === current.slug;
              return (
                <li key={workspace.id}>
                  <Link
                    data-switcher-item
                    href={`/w/${workspace.slug}${section ? `/${section}` : ""}`}
                    aria-current={isCurrent ? "true" : undefined}
                    onClick={() => setOpen(false)}
                    className={cx(
                      "flex items-center gap-2.5 rounded-md px-2 py-1.5 text-fg hover:bg-sunken hover:text-fg",
                      isCurrent && "bg-primary-soft",
                    )}
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
            data-switcher-item
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
