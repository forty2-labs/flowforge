"use client";

import { cx } from "@flowforge/ui";
import { useId, useState } from "react";
import { COMING, SectionHeading } from "./section-heading";

// Your content, your structure: a mock of the content-type builder, showing
// that a café and a shop shape their content differently on one platform.
// Content types arrive in the next release, and the mock says so.

type Example = "cafe" | "retail";

const TYPES: Record<Example, { label: string; type: string; fields: [string, string][] }> = {
  cafe: {
    label: "Café",
    type: "Menu item",
    fields: [
      ["Name", "Text"],
      ["Description", "Rich text"],
      ["Price", "Number"],
      ["Category", "Choice"],
      ["Image", "Image"],
      ["Dietary information", "Choice"],
      ["Availability", "Toggle"],
    ],
  },
  retail: {
    label: "Retail",
    type: "Product",
    fields: [
      ["Name", "Text"],
      ["Description", "Rich text"],
      ["Price", "Number"],
      ["Images", "Image"],
      ["Variants", "List"],
      ["Category", "Choice"],
      ["Stock status", "Choice"],
    ],
  },
};

const BENEFITS = [
  ["Fields you name", "A price, a pairing, an allergen: call each field what your business calls it."],
  ["Types for each part of your business", "Menu items, products, events and opening hours each get their own form."],
  ["Change the structure without a rebuild", "Add a field next season, and your website and app pick it up."],
];

export function Structure() {
  const [example, setExample] = useState<Example>("cafe");
  const name = useId();
  const current = TYPES[example];
  return (
    <section id="structure" aria-labelledby="structure-title" className="grid scroll-mt-28 gap-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-center">
      <div className="flex flex-col gap-8">
        <SectionHeading
          id="structure"
          eyebrow="Flexible content, not rigid templates"
          title="Your content. Your structure. Your rules."
          intro="Every business is different. Create the content structures you need and shape them around the way your business works."
        />
        <ul className="flex flex-col">
          {BENEFITS.map(([title, text]) => (
            <li key={title} className="flex flex-col gap-1 border-t border-line-strong py-4">
              <h3 className="text-title text-fg">{title}</h3>
              <p className="text-body text-fg-secondary">{text}</p>
            </li>
          ))}
        </ul>
      </div>

      <div className="glass-strong flex flex-col gap-4 rounded-xl p-4 shadow-dialog sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <fieldset className="flex gap-1 rounded-full bg-sunken p-1">
            <legend className="sr-only">Example business</legend>
            {(Object.keys(TYPES) as Example[]).map((id) => (
              <label
                key={id}
                className={cx(
                  "flex min-h-11 cursor-pointer items-center rounded-full px-4 text-body",
                  "has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-(--ff-focus-ring)",
                  example === id ? "bg-surface font-semibold text-fg" : "text-fg-secondary hover:text-fg",
                )}
              >
                <input type="radio" name={name} value={id} checked={example === id} onChange={() => setExample(id)} className="sr-only" />
                {TYPES[id].label}
              </label>
            ))}
          </fieldset>
          <span className="text-label text-fg-secondary">{COMING}</span>
        </div>

        <div className="rounded-lg border border-line bg-surface">
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <span className="flex flex-col">
              <span className="text-helper text-fg-secondary">Content type</span>
              <span className="text-title text-fg">{current.type}</span>
            </span>
            <span className="text-label text-fg-secondary">{current.fields.length} fields</span>
          </div>
          <ul key={example} aria-label={`${current.type} fields`} className="flex flex-col">
            {current.fields.map(([field, kind], i) => (
              <li
                key={field}
                style={{ animationDelay: `${i * 30}ms` }}
                className="ff-row-in flex min-h-11 items-center justify-between gap-3 border-b border-line px-4 py-2 last:border-b-0"
              >
                <span className="flex items-center gap-3 text-body text-fg">
                  <span aria-hidden="true" className="flex flex-col gap-0.5">
                    <span className="h-0.5 w-2.5 rounded-full bg-line-strong" />
                    <span className="h-0.5 w-2.5 rounded-full bg-line-strong" />
                  </span>
                  {field}
                </span>
                <span className="rounded-sm bg-sunken px-2 py-0.5 text-label text-fg-secondary">{kind}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
