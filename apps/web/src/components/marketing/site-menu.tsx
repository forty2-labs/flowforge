"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";

// The phone menu for the public site. Built on the native <dialog>, like the
// app's MobileNav: it traps focus, closes on Esc and returns focus to the
// menu button.
export function SiteMenu({ links }: { links: readonly { href: string; label: string }[] }) {
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
    <>
      <button
        type="button"
        aria-label="Menu"
        aria-expanded={open}
        aria-controls={drawerId}
        onClick={() => setOpen(true)}
        className="inline-flex h-11 w-11 flex-none items-center justify-center rounded-md text-fg-secondary hover:bg-glass-hover hover:text-fg md:hidden"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          <path d="M4 7h16M4 12h16M4 17h10" />
        </svg>
      </button>
      <dialog
        ref={drawer}
        id={drawerId}
        aria-label="Menu"
        onClose={() => setOpen(false)}
        onClick={(event) => {
          if (event.target === event.currentTarget) setOpen(false);
        }}
        className="ff-drawer glass-strong m-0 h-dvh max-h-none w-[min(20rem,85vw)] max-w-none rounded-r-xl border-l-0 p-0 text-fg backdrop:bg-backdrop"
      >
        <div className="flex min-h-full flex-col gap-2 px-3 pt-3 pb-3">
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="inline-flex h-11 w-11 items-center justify-center self-end rounded-md text-fg-secondary hover:bg-glass-hover hover:text-fg"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
          <nav aria-label="Site" className="flex flex-col gap-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                aria-current={pathname === link.href ? "page" : undefined}
                className="flex min-h-11 items-center rounded-md px-3 text-title text-fg hover:bg-glass-hover hover:text-fg"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/signin"
              className="flex min-h-11 items-center rounded-md px-3 text-title text-fg hover:bg-glass-hover hover:text-fg"
            >
              Sign in
            </Link>
          </nav>
        </div>
      </dialog>
    </>
  );
}
