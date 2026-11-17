import { Wordmark } from "@flowforge/ui";
import Link from "next/link";
import { NAV_LINKS } from "@/lib/site";
import { SiteMenu } from "./site-menu";
import { ThemeSwitch } from "./theme-switch";

// The public site's top bar: glass over the ground, one primary action.
export function SiteHeader() {
  return (
    <header className="glass sticky top-0 z-30 border-x-0 border-t-0">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-2 px-4 sm:px-6 lg:px-8">
        <Link href="/" aria-label="Flowforge home" className="mr-4 rounded-md py-1 text-fg hover:text-fg">
          <Wordmark size={26} />
        </Link>
        <nav aria-label="Main" className="hidden flex-1 items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="inline-flex min-h-11 items-center rounded-md px-3 text-body text-fg-secondary hover:bg-glass-hover hover:text-fg"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-1 md:ml-0">
          <ThemeSwitch />
          <Link
            href="/signin"
            className="hidden min-h-11 items-center rounded-md px-3 text-body text-fg-secondary hover:bg-glass-hover hover:text-fg md:inline-flex"
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="inline-flex h-11 items-center rounded-md bg-primary px-4 text-body font-medium whitespace-nowrap text-on-primary transition-colors duration-[120ms] hover:bg-primary-hover hover:text-on-primary"
          >
            Get started
          </Link>
          <SiteMenu links={NAV_LINKS} />
        </div>
      </div>
    </header>
  );
}
