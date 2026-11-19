import { SectionHeading } from "./section-heading";

// More freedom, less complexity: the product's philosophy, as an editorial
// list. Workspaces and roles are ready today; the rest is how Flowforge is
// built to work.
const REASONS = [
  ["Manage content centrally", "Menus, products and pages live in one place, not in each site."],
  ["Websites and mobile apps", "One set of content, built to feed every screen you run."],
  ["Structures you design", "Shape your content around your business, not a template."],
  ["Reuse across experiences", "Write an entry once and use it wherever it is needed."],
  ["Workspaces for each business", "Keep each business separate, with its own team and roles. Ready today."],
  ["Content apart from design", "Change how a site looks without touching what it says."],
];

export function Why() {
  return (
    <section aria-labelledby="why-title" className="grid gap-12 lg:grid-cols-[1fr_2fr]">
      <SectionHeading id="why" eyebrow="Why Flowforge" title="More freedom. Less complexity." />
      <ul className="grid gap-x-10 sm:grid-cols-2">
        {REASONS.map(([title, text]) => (
          <li key={title} className="flex flex-col gap-1 border-t border-line-strong py-5">
            <h3 className="text-title text-fg">{title}</h3>
            <p className="text-body text-fg-secondary">{text}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
