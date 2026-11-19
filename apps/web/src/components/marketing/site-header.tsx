"use client";

import { buttonClasses, cx, Wordmark } from "@flowforge/ui";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_LINKS } from "@/lib/site";
import { SiteMenu } from "./site-menu";
import { ThemeSwitch } from "./theme-switch";
import { useScrolled } from "./use-scrolled";

const navLink =
  "inline-flex min-h-11 items-center whitespace-nowrap rounded-full px-3 text-body text-fg-secondary hover:bg-glass-hover hover:text-fg";

// The public site's top bar. On the home page it starts as a compact bar
// sitting almost flush with the ground, and widens into a floating glass
// bar once the page scrolls. Pages without a hero start floating.
export function SiteHeader() {
  const pathname = usePathname();
  const scrolledPast = useScrolled();
  const floating = pathname !== "/" || scrolledPast;

  return (
    <header className="pointer-events-none fixed inset-x-0 top-3 z-30 px-3 sm:top-4 sm:px-4">
      <div
        data-testid="site-bar"
        data-scrolled={floating}
        className={cx(
          "pointer-events-auto mx-auto flex h-14 items-center gap-2 rounded-full pr-2 pl-4 sm:h-16 sm:pr-3 sm:pl-5",
          "transition-[max-width,background-color,border-color,box-shadow] duration-300 ease-(--ff-ease-out) motion-reduce:transition-none",
          floating ? "glass-strong max-w-7xl border-line-strong shadow-dialog" : "glass max-w-5xl",
        )}
      >
        <Link href="/" aria-label="Flowforge home" className="min-w-0 rounded-md py-1 text-fg hover:text-fg md:mr-2">
          <Wordmark size={24} />
        </Link>
        <nav aria-label="Main" className="hidden flex-1 items-center justify-center gap-0.5 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={pathname === link.href ? "page" : undefined}
              className={cx(navLink, "wide" in link && "hidden lg:inline-flex")}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex flex-none items-center gap-0.5 sm:gap-1 md:ml-0">
          <ThemeSwitch />
          <Link href="/signin" className={cx(navLink, "hidden md:inline-flex")}>
            Sign in
          </Link>
          <Link href="/signup" className={buttonClasses({ className: "px-4 sm:px-5" })}>
            Get started
          </Link>
          <SiteMenu links={NAV_LINKS} />
        </div>
      </div>
    </header>
  );
}
