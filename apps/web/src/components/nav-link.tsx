"use client";

import { cx } from "@flowforge/ui";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

export function NavLink({
  href,
  exact = false,
  icon,
  children,
}: {
  href: string;
  exact?: boolean;
  icon: string;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const active = exact ? pathname === href : pathname.startsWith(href);
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cx(
        "flex min-h-9 items-center gap-2.5 rounded-md px-2.5 text-body pointer-coarse:min-h-11",
        // The active section is a solid pill on the glass.
        active
          ? "bg-glass-active font-medium text-fg shadow-[0_1px_2px_rgb(14_23_38/0.06)]"
          : "text-fg-secondary hover:bg-glass-hover hover:text-fg",
      )}
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        className={active ? "text-primary" : "text-fg-muted"}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d={icon} />
      </svg>
      {children}
    </Link>
  );
}
