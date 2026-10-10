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
        "flex min-h-[34px] items-center gap-2.5 rounded-md px-2.5 text-sm hover:text-white",
        active ? "bg-sidebar-active font-medium text-white" : "text-on-ink",
      )}
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke={active ? "#A9B6FF" : "#8B95A8"}
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
