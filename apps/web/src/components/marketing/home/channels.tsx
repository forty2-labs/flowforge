"use client";

import { cx, StatusMark } from "@flowforge/ui";
import { useRef, type ReactNode } from "react";
import { Connector } from "./connector";
import { useSeen } from "./reveal";
import { SectionHeading } from "./section-heading";

// Create once, experience everywhere: the content workspace on the left,
// the API in the middle, and four places the same content shows up. On wide
// screens the parts sit on a 16:9 stage and SVG lines join them, drawn in
// once when the stage is seen, then carrying a published dot now and then.
// Coordinates below are in the stage's 1600 × 900 viewBox; the boxes use
// the same numbers as percentages, so lines and boxes always meet.

const ENTRIES = [
  { type: "Menu item", title: "Flat white", status: "published" },
  { type: "Product", title: "Linen tote", status: "changed" },
  { type: "Article", title: "Spring opening hours", status: "published" },
  { type: "Business info", title: "Harbour Café, Quay Street", status: "draft" },
] as const;

const LINES = [
  "M640 450 L722 450",
  "M798 450 C 840 450, 840 235, 880 235",
  "M798 450 C 900 450, 1000 420, 1000 488",
  "M798 450 C 1010 450, 1250 410, 1250 488",
  "M798 450 C 1120 450, 1500 400, 1500 488",
];

function Workspace() {
  return (
    <div className="glass-strong flex h-full min-h-0 overflow-hidden rounded-xl shadow-dialog">
      <div className="hidden w-2/5 flex-none flex-col gap-1 border-r border-line p-3 sm:flex">
        <span className="mb-1 text-label font-medium text-fg">Harbour Group</span>
        {["Menu items", "Products", "Articles", "Business info"].map((item, i) => (
          <span key={item} className={cx("rounded-md px-2 py-1 text-label", i === 0 ? "bg-sunken text-fg" : "text-fg-secondary")}>
            {item}
          </span>
        ))}
      </div>
      <ul className="flex min-w-0 flex-1 flex-col">
        {ENTRIES.map((entry) => (
          <li key={entry.title} className="flex flex-col gap-1 border-b border-line px-3 py-2.5 last:border-b-0">
            <span className="text-helper text-fg-secondary">{entry.type}</span>
            <span className="truncate font-serif text-title text-fg">{entry.title}</span>
            <StatusMark status={entry.status} className="text-fg-secondary" />
          </li>
        ))}
      </ul>
    </div>
  );
}

function Screen({ label, kind, children }: { label: string; kind: "web" | "phone"; children: ReactNode }) {
  return (
    <figure className="flex h-full min-h-0 flex-col items-center gap-2">
      <div
        aria-hidden="true"
        className={cx(
          "flex min-h-0 w-full flex-1 flex-col overflow-hidden border border-line-strong bg-surface",
          kind === "web" ? "rounded-lg" : "max-w-40 rounded-2xl p-1",
        )}
      >
        {kind === "web" && (
          <span className="flex items-center gap-1 border-b border-line bg-sunken px-2 py-1.5">
            {[0, 1, 2].map((dot) => (
              <span key={dot} className="h-1.5 w-1.5 rounded-full bg-line-strong" />
            ))}
          </span>
        )}
        <div className={cx("flex flex-1 flex-col gap-1.5 p-2.5", kind === "phone" && "rounded-xl bg-raised")}>{children}</div>
      </div>
      <figcaption className="text-label font-medium text-fg">{label}</figcaption>
    </figure>
  );
}

function MenuSketch({ wide = false }: { wide?: boolean }) {
  return (
    <>
      <span className="text-helper font-medium text-fg">Harbour Café</span>
      <span className="h-1 w-6 rounded-full bg-sample-forest" />
      <span className={cx("flex items-baseline justify-between font-serif text-fg", wide ? "text-title" : "text-label")}>
        Flat white <span className="font-sans text-helper text-fg-secondary tabular-nums">3.20</span>
      </span>
      <span className="h-1.5 w-full rounded-full bg-sunken" />
      <span className="h-1.5 w-3/4 rounded-full bg-sunken" />
      <span className={cx("flex items-baseline justify-between font-serif text-fg", wide ? "text-title" : "text-label")}>
        Rhubarb tart <span className="font-sans text-helper text-fg-secondary tabular-nums">4.50</span>
      </span>
      <span className="h-1.5 w-2/3 rounded-full bg-sunken" />
      <span className="mt-auto h-5 w-16 self-start rounded-full bg-sample-forest" />
    </>
  );
}

function ApiNode({ className }: { className?: string }) {
  return (
    <span className={cx("flex h-14 w-14 items-center justify-center rounded-full border border-line-strong bg-surface text-label font-semibold text-fg shadow-dialog", className)}>
      API
    </span>
  );
}

export function Channels() {
  const stage = useRef<HTMLDivElement>(null);
  const seen = useSeen(stage);
  return (
    <section id="channels" aria-labelledby="channels-title" className="flex scroll-mt-28 flex-col gap-12">
      <SectionHeading
        id="channels"
        eyebrow="One CMS, multiple experiences"
        title="Create once. Experience everywhere."
        intro="Your content shouldn't be trapped inside a single website. Manage it centrally and deliver it to every digital experience through one flexible platform."
      />

      {/* Wide screens: one stage, joined by lines. */}
      <div ref={stage} className="relative hidden aspect-video lg:block">
        <svg aria-hidden="true" viewBox="0 0 1600 900" className="absolute inset-0 h-full w-full">
          {LINES.map((d, i) => (
            <Connector key={d} d={d} drawn={seen} delay={i * 120} travel={i > 0} />
          ))}
        </svg>
        <div className="absolute top-[20%] left-0 h-[60%] w-[40%]">
          <Workspace />
        </div>
        <ApiNode className="absolute top-1/2 left-[47.5%] -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute top-[3%] left-[55%] h-[44%] w-[45%]">
          <Screen label="Desktop website" kind="web">
            <MenuSketch wide />
          </Screen>
        </div>
        {[
          ["Mobile website", "left-[56.25%]"],
          ["iOS app", "left-[71.875%]"],
          ["Android app", "left-[87.5%]"],
        ].map(([label, left]) => (
          <div key={label} className={cx("absolute top-[54%] h-[40%] w-[12.5%]", left)}>
            <Screen label={label!} kind="phone">
              <MenuSketch />
            </Screen>
          </div>
        ))}
      </div>

      {/* Narrower screens: the same parts, stacked, joined by a short line. */}
      <div className="flex flex-col items-center gap-4 lg:hidden">
        <div className="w-full max-w-md">
          <Workspace />
        </div>
        <span aria-hidden="true" className="h-6 w-px bg-line-strong" />
        <ApiNode />
        <span aria-hidden="true" className="h-6 w-px bg-line-strong" />
        <div className="grid w-full grid-cols-2 gap-4 sm:grid-cols-4">
          {(["Desktop website", "Mobile website", "iOS app", "Android app"] as const).map((label) => (
            <div key={label} className="h-44">
              <Screen label={label} kind={label === "Desktop website" ? "web" : "phone"}>
                <MenuSketch />
              </Screen>
            </div>
          ))}
        </div>
      </div>

      <p className="max-w-2xl text-body text-fg-secondary">
        Native apps read the same content through the API. SDKs are on the roadmap.
      </p>
    </section>
  );
}
