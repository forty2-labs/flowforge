import { LogoMark } from "@flowforge/ui";

export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex min-h-screen flex-wrap bg-surface">
      <main className="flex min-w-0 flex-[1_1_480px] flex-col px-6 py-8">
        <div className="mx-auto flex w-full max-w-[400px] items-center gap-2.5">
          <LogoMark size={30} />
          <span className="text-title">
            Flowforge
          </span>
        </div>
        <div className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-[400px]">{children}</div>
        </div>
      </main>
      <aside
        aria-hidden="true"
        className="flex min-h-[320px] min-w-0 flex-[1_1_480px] items-center justify-center bg-ink px-8 py-12 text-on-ink"
      >
        <div className="flex w-full max-w-[460px] flex-col gap-7">
          <p className="font-serif text-article-title font-normal text-white">
            Manage the content and layouts of your website and apps in one
            place.
          </p>
          <div className="flex flex-wrap items-center gap-2 text-label">
            {["One platform", "Many workspaces", "Many experiences"].map(
              (step, index) => (
                <span key={step} className="flex items-center gap-2">
                  {index > 0 && <span className="text-on-ink-muted">→</span>}
                  <span className="rounded-full border border-line-on-ink bg-sidebar-raised px-2.5 py-0.5">
                    {step}
                  </span>
                </span>
              ),
            )}
          </div>
          <span className="text-label text-on-ink-muted">
            Content lives once in a workspace and is reused by every page and
            website that needs it.
          </span>
        </div>
      </aside>
    </div>
  );
}
