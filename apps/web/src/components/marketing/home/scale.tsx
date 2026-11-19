"use client";

import { cx } from "@flowforge/ui";
import { useId, useState } from "react";
import { SectionHeading } from "./section-heading";

// Start small, scale without starting over: five stages of one business
// growing, picked with a stepper (a native radio group, so arrow keys move
// between stages). Each stage adds a screen to the workspace above it.

const STAGES = [
  { label: "One website", text: "Start with one café website." },
  { label: "Add an app", text: "Add a phone app. It reads the same menu." },
  { label: "New location", text: "Open a second café, with its own hours and specials." },
  { label: "A shop", text: "Launch a retail shop for your beans and mugs." },
  { label: "One workspace", text: "Run every experience from one workspace, without rebuilding anything." },
];

const SCREENS = [
  { name: "Harbour Café", kind: "Website", accent: "bg-sample-forest" },
  { name: "Harbour Café", kind: "Phone app", accent: "bg-sample-forest" },
  { name: "Harbour Café Quayside", kind: "Website", accent: "bg-sample-ocean" },
  { name: "Harbour Goods", kind: "Shop", accent: "bg-sample-ink" },
];

export function Scale() {
  const [stage, setStage] = useState(1);
  const name = useId();
  const shown = Math.min(stage, SCREENS.length);
  return (
    <section id="scale" aria-labelledby="scale-title" className="flex scroll-mt-28 flex-col gap-12">
      <SectionHeading
        id="scale"
        eyebrow="Designed to grow with your business"
        title="Start small. Scale without starting over."
        intro="Your content lives in one place from the first day, so adding a screen, a location or a whole new business builds on what is already there."
      />

      <fieldset className="flex flex-col gap-4">
        <legend className="sr-only">Stage of growth</legend>
        <div className="grid grid-cols-5 gap-1 rounded-full bg-sunken p-1">
          {STAGES.map((item, i) => (
            <label
              key={item.label}
              className={cx(
                "flex min-h-11 cursor-pointer items-center justify-center rounded-full px-2 text-center text-label sm:text-body",
                "has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-(--ff-focus-ring)",
                i + 1 <= stage ? "text-fg" : "text-fg-secondary hover:text-fg",
                i + 1 === stage && "bg-surface font-semibold",
              )}
            >
              <input type="radio" name={name} value={i + 1} checked={stage === i + 1} onChange={() => setStage(i + 1)} className="sr-only" />
              <span className="sm:hidden">{i + 1}</span>
              <span className="hidden sm:inline">{item.label}</span>
              <span className="sr-only sm:hidden">{item.label}</span>
            </label>
          ))}
        </div>
        <p aria-live="polite" className="text-body text-fg-secondary">
          {STAGES[stage - 1]!.text}
        </p>
      </fieldset>

      <div data-testid="scale-stage" data-stage={stage} aria-hidden="true" className="flex flex-col items-center gap-0">
        <span
          className={cx(
            "rounded-full border px-5 py-2.5 text-body font-semibold transition-colors duration-300",
            stage === 5 ? "border-line-strong bg-surface text-fg" : "border-line bg-raised text-fg-secondary",
          )}
        >
          Harbour Group workspace
        </span>
        <span className="h-6 w-px bg-line-strong" />
        <span className="h-px w-3/4 bg-line-strong sm:w-3/4" />
        <div className="grid w-full grid-cols-2 gap-3 sm:grid-cols-4">
          {SCREENS.map((screen, i) => (
            <div
              key={`${screen.name}-${screen.kind}`}
              className={cx(
                "flex flex-col items-center transition-[opacity,translate] duration-300 ease-(--ff-ease-out) motion-reduce:transition-none",
                i < shown ? "opacity-100" : "translate-y-2 opacity-0",
              )}
            >
              <span className="h-6 w-px bg-line-strong" />
              <div className="flex w-full flex-col gap-2 rounded-lg border border-line bg-surface p-3">
              <span className="flex items-center gap-2">
                <span className={cx("h-2 w-2 rounded-full ring-1 ring-line-strong", screen.accent)} />
                <span className="truncate text-label font-medium text-fg">{screen.name}</span>
              </span>
              <span className="h-1.5 w-full rounded-full bg-sunken" />
              <span className="h-1.5 w-2/3 rounded-full bg-sunken" />
              <span className="text-helper text-fg-secondary">{screen.kind}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
