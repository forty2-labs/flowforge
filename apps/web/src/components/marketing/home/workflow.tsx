"use client";

import { StatusMark } from "@flowforge/ui";
import { useRef, type ReactNode } from "react";
import { Connector } from "./connector";
import { useSeen } from "./reveal";
import { COMING, SectionHeading } from "./section-heading";

// From idea to published: three steps, each with a small picture of the
// screen it happens on, joined by a line that draws in when the steps are
// first seen. The line runs across on wide screens and down the left on
// phones, where the steps become a timeline.

const STEPS: { title: string; text: string; vignette: ReactNode }[] = [
  {
    title: "Structure",
    text: "Define the content your business needs: the types of entry you publish and the fields each one has.",
    vignette: (
      <span className="flex flex-col gap-1.5">
        {[
          ["Name", "Text"],
          ["Price", "Number"],
          ["Photo", "Image"],
        ].map(([field, kind]) => (
          <span key={field} className="flex items-center justify-between rounded-md border border-line bg-surface px-2.5 py-1.5 text-label text-fg">
            {field}
            <span className="text-helper text-fg-secondary">{kind}</span>
          </span>
        ))}
      </span>
    ),
  },
  {
    title: "Create",
    text: "Write and update entries in one workspace, with their images and the details that change week to week.",
    vignette: (
      <span className="flex gap-2.5 rounded-md border border-line bg-surface p-2.5">
        <span className="aspect-square w-14 flex-none rounded-sm bg-sample-forest" />
        <span className="flex min-w-0 flex-1 flex-col gap-1.5">
          <span className="font-serif text-title text-fg">Flat white</span>
          <span className="h-1.5 w-full rounded-full bg-sunken" />
          <span className="h-1.5 w-2/3 rounded-full bg-sunken" />
        </span>
      </span>
    ),
  },
  {
    title: "Publish",
    text: "Publish once, and every website and app connected to the workspace reads the same entry.",
    vignette: (
      <span className="flex flex-col gap-2 rounded-md border border-line bg-surface p-2.5">
        <StatusMark status="changed" className="text-fg-secondary" />
        <StatusMark status="published" className="text-fg-secondary" />
        <span className="text-label text-fg-secondary">Website and app updated</span>
      </span>
    ),
  },
];

export function Workflow() {
  const steps = useRef<HTMLOListElement>(null);
  const seen = useSeen(steps);
  return (
    <section id="workflow" aria-labelledby="workflow-title" className="flex scroll-mt-28 flex-col gap-12">
      <SectionHeading
        id="workflow"
        eyebrow="From idea to published"
        title="Your workflow, without the complexity."
      />
      <div className="relative">
        <svg aria-hidden="true" viewBox="0 0 1000 40" preserveAspectRatio="none" className="absolute top-0 left-0 hidden h-10 w-full md:block">
          <Connector d="M20 20 C 120 4, 240 36, 361 20 S 600 4, 704 20" drawn={seen} className="[vector-effect:non-scaling-stroke]" />
        </svg>
        <svg aria-hidden="true" viewBox="0 0 40 1000" preserveAspectRatio="none" className="absolute top-0 left-0 h-full w-10 md:hidden">
          <Connector d="M20 10 L20 990" drawn={seen} className="[vector-effect:non-scaling-stroke]" />
        </svg>
        <ol ref={steps} aria-label="From idea to published" className="relative grid gap-10 md:grid-cols-3 md:gap-8">
          {STEPS.map((step, i) => (
            <li key={step.title} className="relative flex flex-col gap-4 pl-14 md:pl-0">
              <span className="absolute left-0 flex h-10 w-10 items-center justify-center rounded-full border border-line-strong bg-surface text-label font-semibold text-fg tabular-nums md:static">
                {i + 1}
              </span>
              <h3 className="text-section text-fg">{step.title}</h3>
              <p className="max-w-80 text-body text-fg-secondary">{step.text}</p>
              <div aria-hidden="true" className="max-w-80">{step.vignette}</div>
            </li>
          ))}
        </ol>
      </div>
      <p className="text-label text-fg-secondary">{COMING}: content types, entries and publishing. Workspaces and teams are ready now.</p>
    </section>
  );
}
