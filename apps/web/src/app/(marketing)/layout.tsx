import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteHeader } from "@/components/marketing/site-header";

export default function MarketingLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <a
        href="#main"
        className="sr-only z-50 rounded-md bg-surface px-4 py-3 text-body focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Skip to content
      </a>
      <SiteHeader />
      {/* The header watches this 24 px strip at the very top of the page to
          know when the page has scrolled. */}
      <div id="scroll-sentinel" aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-6" />
      {/* The header floats over the page; this keeps content clear of it. */}
      <div aria-hidden="true" className="h-20 flex-none sm:h-24" />
      <main id="main" className="flex-1">
        {children}
      </main>
      <SiteFooter />
    </>
  );
}
