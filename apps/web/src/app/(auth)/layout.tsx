import { StatusMark, Wordmark } from "@flowforge/ui";

export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex min-h-screen flex-wrap">
      <main className="flex min-w-0 flex-[1_1_480px] flex-col px-6 py-8">
        <div className="mx-auto w-full max-w-100">
          <Wordmark size={30} />
        </div>
        <div className="flex flex-1 items-center justify-center py-10">
          <div className="glass w-full max-w-100 rounded-xl p-6 sm:p-8">{children}</div>
        </div>
      </main>
      <aside
        aria-hidden="true"
        data-surface="ink"
        className="m-3 flex min-w-0 flex-[1_1_480px] items-center justify-center rounded-xl bg-ink px-8 py-16 text-on-ink"
      >
        <EntryProof />
      </aside>
    </div>
  );
}

// One entry, set as a page proof: content in the content face, its
// lifecycle mark, and the pages that reuse it. It shows what Flowforge does
// instead of describing it.
function EntryProof() {
  return (
    <div className="flex w-full max-w-110 flex-col gap-8">
      <div className="relative px-7 py-8">
        <CropMarks />
        <StatusMark status="published" onInk animate className="text-on-ink" />
        <p className="mt-5 font-serif text-article-display text-white">
          Spring menu, now serving
        </p>
        <p className="mt-4 font-serif text-article text-on-ink">
          Wild garlic soup, rhubarb tart with crème fraîche, and the first
          asparagus from Hollow Farm. Lunch from twelve, Tuesday to Sunday.
        </p>
      </div>
      <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 px-7 text-label">
        <dt className="text-on-ink-muted">Shown on</dt>
        <dd className="flex flex-col gap-2 text-white">
          <span>Homepage</span>
          <span>Menu page</span>
          <span>Opening hours banner</span>
        </dd>
      </dl>
      <p className="px-7 text-body text-on-ink-muted">
        Write it once in your workspace. Every page that needs it shows the
        same words, and they change together when you publish.
      </p>
    </div>
  );
}

// Printer's crop marks at each corner of the proof.
function CropMarks() {
  const corner = "absolute h-3 w-3 border-on-ink-subtle";
  return (
    <>
      <span className={`${corner} top-0 left-0 border-t border-l`} />
      <span className={`${corner} top-0 right-0 border-t border-r`} />
      <span className={`${corner} bottom-0 left-0 border-b border-l`} />
      <span className={`${corner} right-0 bottom-0 border-r border-b`} />
    </>
  );
}
