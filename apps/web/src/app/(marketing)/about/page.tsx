import { Avatar } from "@flowforge/ui";
import type { Metadata } from "next";
import { TEAM } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description: "Why we are building Flowforge, what we believe about publishing, and who we are.",
};

const PRINCIPLES = [
  {
    title: "Content looks like content",
    text: "What you publish is set as it will be read, not squeezed into form fields. You can tell your words from the tool around them.",
  },
  {
    title: "One clear next step",
    text: "Every screen has one obvious thing to do. Drafts, changes and published work are marked the same way everywhere.",
  },
  {
    title: "Everyone can use it",
    text: "It works from the keyboard, with a screen reader, on a small phone and in dark mode. That is the starting point, not an extra.",
  },
];

export default function AboutPage() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-24 px-4 pt-16 sm:px-6 sm:pt-24 lg:px-8">
      <div className="grid gap-10 lg:grid-cols-[1fr_1fr]">
        <h1 className="max-w-lg text-display text-fg">One business, many places its words appear</h1>
        <div className="flex max-w-xl flex-col gap-4 text-section font-normal text-fg-secondary">
          <p>
            A café&apos;s menu lives on its website, in its app, on a banner by
            the door and in a post on Friday. Each copy drifts a little, until
            someone orders the soup that went off the menu last week.
          </p>
          <p>
            We are building Flowforge so a business writes those words once and
            every place that shows them stays in step.
          </p>
        </div>
      </div>

      <section aria-labelledby="principles-title" className="flex flex-col gap-10">
        <h2 id="principles-title" className="text-page text-fg">What we believe</h2>
        <ul className="grid gap-10 md:grid-cols-3">
          {PRINCIPLES.map((item) => (
            <li key={item.title} className="flex flex-col gap-3 border-t border-line-strong pt-6">
              <h3 className="text-section text-fg">{item.title}</h3>
              <p className="text-body text-fg-secondary">{item.text}</p>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="team-title" className="glass grid gap-8 rounded-lg p-6 sm:p-10 lg:grid-cols-[1fr_2fr]">
        <div className="flex flex-col gap-3">
          <h2 id="team-title" className="text-page text-fg">Who we are</h2>
          <p className="text-body text-fg-secondary">
            A small team of designers and engineers who have built publishing
            tools for newsrooms, shops and studios.
          </p>
        </div>
        <ul aria-label="Team" className="flex flex-col">
          {TEAM.map((person) => (
            <li key={person.name} className="flex items-center gap-4 border-t border-line py-4 first:border-t-0">
              <Avatar name={person.name} />
              <div className="flex flex-col">
                <span className="text-title text-fg">{person.name}</span>
                <span className="text-body text-fg-muted">{person.role}</span>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
