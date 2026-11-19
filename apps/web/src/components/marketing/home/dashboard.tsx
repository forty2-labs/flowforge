import { cx, StatusMark } from "@flowforge/ui";
import { Reveal } from "./reveal";
import { COMING, SectionHeading } from "./section-heading";

// Powerful underneath, simple on the surface: a preview of the workspace,
// on a graphite section that is dark in both page themes (it sets
// data-theme itself, so every token inside takes its dark value). Four notes
// point at the parts that matter. Its border sets it apart from a page
// that is itself dark. Team, workspaces and roles exist today;
// content types, entries and media arrive in the next release.

// The notes sit in the gutters either side of the preview on wide screens,
// level with the part each one describes, and below it on narrow ones.
const NOTES = [
  { title: "Organised content", text: "Every entry sits under its type, with its status beside it.", side: "left" },
  { title: "Reusable structures", text: "One content type serves every page that needs it.", side: "right" },
  { title: "Central media", text: "Photos live in one library, used wherever they are needed.", side: "left" },
  { title: "Instant publishing", text: "Publish once and every connected screen updates.", side: "right" },
] as const;

const ROWS = [
  { title: "Spring menu", type: "Menu", status: "published" },
  { title: "Flat white", type: "Menu item", status: "changed" },
  { title: "Rhubarb tart", type: "Menu item", status: "draft" },
  { title: "Quay Street opening", type: "Article", status: "published" },
  { title: "Opening hours", type: "Business info", status: "published" },
] as const;

function Preview() {
  return (
    <div aria-hidden="true" className="glass-strong overflow-hidden rounded-xl border-line-strong shadow-dialog">
      <div className="flex">
        <div className="hidden w-44 flex-none flex-col gap-1 border-r border-line p-3 md:flex">
          <span className="mb-2 flex items-center justify-between rounded-md border border-line px-2.5 py-2 text-label font-medium text-fg">
            Harbour Group
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-fg-secondary">
              <path d="M6 9l6 6 6-6" />
            </svg>
          </span>
          {["Content types", "Entries", "Media", "Team"].map((item, i) => (
            <span key={item} className={cx("rounded-md px-2.5 py-1.5 text-label", i === 1 ? "bg-glass-active text-fg" : "text-fg-secondary")}>
              {item}
            </span>
          ))}
        </div>
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
            <span className="text-title text-fg">Entries</span>
            <span className="flex items-center gap-2">
              <span className="hidden rounded-full border border-line px-3 py-1 text-label text-fg-secondary sm:inline">Preview</span>
              <span className="rounded-full bg-primary px-3 py-1 text-label font-semibold text-on-primary">Publish</span>
            </span>
          </div>
          <div className="grid grid-cols-[minmax(0,1fr)_9.5rem] gap-x-4 border-b border-line px-4 py-2 text-helper text-fg-secondary sm:grid-cols-[minmax(0,1fr)_7rem_9.5rem]">
            <span>Title</span>
            <span className="hidden sm:block">Type</span>
            <span>Status</span>
          </div>
          {ROWS.map((row) => (
            <div key={row.title} className="grid grid-cols-[minmax(0,1fr)_9.5rem] items-center gap-x-4 border-b border-line px-4 py-2.5 last:border-b-0 sm:grid-cols-[minmax(0,1fr)_7rem_9.5rem]">
              <span className="truncate font-serif text-body text-fg">{row.title}</span>
              <span className="hidden truncate text-label text-fg-secondary sm:block">{row.type}</span>
              <StatusMark status={row.status} className="text-fg-secondary" />
            </div>
          ))}
          <div className="grid grid-cols-6 gap-2 border-t border-line p-4">
            {[0, 1, 2, 3, 4, 5].map((tile) => (
              <span key={tile} className={cx("aspect-4/3 rounded-md border border-line", ["bg-sample-forest", "bg-raised", "bg-sample-clay", "bg-raised", "bg-sample-ocean", "bg-raised"][tile])} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function Dashboard() {
  return (
    <section
      id="dashboard"
      data-theme="dark"
      aria-labelledby="dashboard-title"
      className="flex scroll-mt-28 flex-col gap-12 rounded-xl border border-line-strong bg-app px-5 py-14 text-fg sm:px-10 sm:py-20"
    >
      <div className="flex flex-wrap items-end justify-between gap-6">
        <SectionHeading
          id="dashboard"
          eyebrow="Beautifully simple content management"
          title="Powerful underneath. Simple on the surface."
          intro="Everyday updates stay quick, however much sits behind them: types, entries, media and a team, in one workspace."
        />
        <p className="text-label text-fg-secondary">{COMING}: content types, entries and media. Teams and roles are ready now.</p>
      </div>

      <div className="grid gap-3 lg:grid-cols-[12rem_minmax(0,1fr)_12rem] lg:items-stretch lg:gap-6">
        <Reveal className="mb-3 lg:col-start-2 lg:row-start-1 lg:mb-0">
          <Preview />
        </Reveal>
        {(["left", "right"] as const).map((side, column) => (
          <ul
            key={side}
            className={cx(
              "grid gap-3 sm:grid-cols-2 lg:row-start-1 lg:flex lg:flex-col lg:justify-around lg:gap-6",
              column === 0 ? "lg:col-start-1" : "lg:col-start-3",
            )}
          >
            {NOTES.filter((note) => note.side === side).map((note) => (
              <li key={note.title}>
                <Reveal delay={300 + NOTES.indexOf(note) * 150} className="glass rounded-lg px-4 py-3">
                  <h3 className="text-label font-semibold text-fg">{note.title}</h3>
                  <p className="text-label text-fg-secondary">{note.text}</p>
                </Reveal>
              </li>
            ))}
          </ul>
        ))}
      </div>
    </section>
  );
}
