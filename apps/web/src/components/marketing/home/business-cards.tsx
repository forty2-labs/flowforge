import { cx } from "@flowforge/ui";
import type { ReactNode } from "react";
import { SectionHeading } from "./section-heading";

// Four kinds of business, each shown as a miniature of the page it would
// run on Flowforge. The miniatures are drawn in HTML with the sample-brand
// colours, so each card has its own look. Hover (pointer only) lifts the
// card and shows one more line; on touch that line is always shown.
const CARDS: { name: string; text: string; more: string; accent: string; mini: ReactNode }[] = [
  {
    name: "Café",
    text: "Menus, opening hours and today's special, kept the same on your site and app.",
    more: "Change a price once and every screen shows it.",
    accent: "bg-sample-forest",
    mini: (
      <>
        <MiniBar title="Harbour Café" accent="bg-sample-forest" />
        <div className="flex flex-col gap-1.5 px-3 py-2.5">
          <span className="rounded-sm bg-sample-forest px-2 py-1 text-helper font-medium text-white">Today: rhubarb tart</span>
          {[
            ["Flat white", "3.20"],
            ["Wild garlic soup", "6.50"],
            ["Sourdough toast", "4.00"],
          ].map(([item, price]) => (
            <span key={item} className="flex justify-between border-b border-line pb-1 font-serif text-label text-fg">
              {item}
              <span className="font-sans tabular-nums text-fg-secondary">{price}</span>
            </span>
          ))}
          <span className="text-helper text-fg-secondary">Open 8–4, Tuesday to Sunday</span>
        </div>
      </>
    ),
  },
  {
    name: "Restaurant",
    text: "Seasonal menus by course, with dietary marks and booking details.",
    more: "Swap the whole menu for autumn without touching the site.",
    accent: "bg-sample-clay",
    mini: (
      <>
        <MiniBar title="Olive & Ember" accent="bg-sample-clay" />
        <div className="grid grid-cols-2 gap-2 px-3 py-2.5">
          {[
            ["Starters", "Burrata", "V"],
            ["Mains", "Hake, brown butter", "GF"],
          ].map(([course, dish, mark]) => (
            <span key={course} className="flex flex-col gap-0.5">
              <span className="text-helper font-medium text-fg-secondary">{course}</span>
              <span className="font-serif text-label text-fg">
                {dish} <span className="font-sans text-helper font-semibold text-fg-secondary">{mark}</span>
              </span>
            </span>
          ))}
          <span className="col-span-2 rounded-sm border border-line px-2 py-1 text-helper text-fg-secondary">
            Autumn menu · Book a table
          </span>
        </div>
      </>
    ),
  },
  {
    name: "Retail",
    text: "Collections, product details and promotions for your online shop.",
    more: "One product, the same photos and price everywhere.",
    accent: "bg-sample-ink",
    mini: (
      <>
        <MiniBar title="Linen & Loom" accent="bg-sample-ink" />
        <div className="flex flex-col gap-2 px-3 py-2.5">
          <span className="font-serif text-label text-fg">The kitchen collection</span>
          <span className="grid grid-cols-3 gap-1.5">
            {["Apron", "Tote", "Cloth"].map((item, i) => (
              <span key={item} className="flex flex-col gap-1">
                <span className={cx("h-12 rounded-sm border border-line-strong", i === 0 ? "bg-sample-ink" : "bg-sunken")} />
                <span className="text-helper text-fg-secondary">{item}</span>
              </span>
            ))}
          </span>
        </div>
      </>
    ),
  },
  {
    name: "Small business",
    text: "Services, testimonials and contact details for the business you run.",
    more: "Add a service and it appears on every page that lists them.",
    accent: "bg-sample-ocean",
    mini: (
      <>
        <MiniBar title="Tide Physio" accent="bg-sample-ocean" />
        <div className="flex flex-col gap-2 px-3 py-2.5">
          <span className="flex flex-wrap gap-1">
            {["Sports injury", "Back care", "Pilates"].map((service) => (
              <span key={service} className="rounded-sm border border-line px-1.5 py-0.5 text-helper text-fg">
                {service}
              </span>
            ))}
          </span>
          <span className="font-serif text-label text-fg italic">“Back running in six weeks.”</span>
          <span className="text-helper text-fg-secondary">Call 01632 960 214</span>
        </div>
      </>
    ),
  },
];

function MiniBar({ title, accent }: { title: string; accent: string }) {
  return (
    <span className="flex items-center gap-2 border-b border-line px-3 py-2">
      <span className={cx("h-2.5 w-2.5 rounded-full ring-1 ring-line-strong", accent)} />
      <span className="text-label font-medium text-fg">{title}</span>
      <span className="ml-auto flex gap-1">
        <span className="h-1 w-4 rounded-full bg-line-strong" />
        <span className="h-1 w-4 rounded-full bg-line-strong" />
      </span>
    </span>
  );
}

export function BusinessCards() {
  return (
    <section id="product" aria-labelledby="product-title" className="flex scroll-mt-28 flex-col gap-12">
      <SectionHeading
        id="product"
        eyebrow="Built for every kind of business"
        title="One platform. Endless possibilities."
        intro="Every business has different content needs. Flowforge gives you the flexibility to manage them all without being locked into a predefined structure."
      />
      <ul className="grid gap-5 md:grid-cols-2 md:items-start">
        {CARDS.map((card, index) => (
          <li
            key={card.name}
            className={cx(
              "group flex flex-col gap-5 rounded-xl border border-line bg-surface p-5 sm:p-6",
              "transition-[translate,border-color] duration-200 ease-(--ff-ease-out) pointer-fine:hover:-translate-y-1 hover:border-line-strong motion-reduce:transition-none motion-reduce:hover:translate-y-0",
              index % 2 === 1 && "md:mt-10",
            )}
          >
            <div aria-hidden="true" className="overflow-hidden rounded-lg border border-line bg-raised">
              <div className="transition-transform duration-300 ease-(--ff-ease-out) pointer-fine:group-hover:-translate-y-1.5 motion-reduce:transition-none">
                {card.mini}
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <h3 className="flex items-center gap-2 text-title text-fg">
                <span aria-hidden="true" className={cx("h-2 w-2 rounded-full ring-1 ring-line-strong", card.accent)} />
                {card.name}
              </h3>
              <p className="text-body text-fg-secondary">{card.text}</p>
              <p className="text-body text-fg transition-opacity duration-200 pointer-fine:opacity-0 pointer-fine:group-hover:opacity-100 motion-reduce:transition-none">
                {card.more}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
