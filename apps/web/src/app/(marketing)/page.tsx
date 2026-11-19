import { buttonClasses } from "@flowforge/ui";
import type { Metadata } from "next";
import Link from "next/link";
import { BusinessCards } from "@/components/marketing/home/business-cards";
import { Channels } from "@/components/marketing/home/channels";
import { Closing } from "@/components/marketing/home/closing";
import { Dashboard } from "@/components/marketing/home/dashboard";
import { Scale } from "@/components/marketing/home/scale";
import { SectionHeading } from "@/components/marketing/home/section-heading";
import { Structure } from "@/components/marketing/home/structure";
import { Why } from "@/components/marketing/home/why";
import { Workflow } from "@/components/marketing/home/workflow";
import { HeroFlow, HeroShapes } from "@/components/marketing/illustrations";
import { Playground } from "@/components/marketing/playground/playground";

const DESCRIPTION =
  "Manage your website and mobile app content from one flexible platform. From your café menu to your online store, Flowforge keeps every digital experience connected.";

export const metadata: Metadata = {
  title: { absolute: "Flowforge: your business, your content, everywhere" },
  description: DESCRIPTION,
  openGraph: {
    title: "Flowforge",
    description: DESCRIPTION,
    type: "website",
  },
};

const QUESTIONS = [
  {
    q: "Do I need a developer to start?",
    a: "No. The plan is that you describe your content in plain fields and start writing, with no code. A developer will be able to go further if you have one.",
  },
  {
    q: "Is the app really the same content as the website?",
    a: "That is the idea. Your website and your app will read the same published entries, so when you publish, both change together. The app is still to come.",
  },
  {
    q: "Can people review work before it goes live?",
    a: "Yes. Drafts will stay private until someone with permission publishes them, and a review step will show what is about to change.",
  },
  {
    q: "Who owns the content?",
    a: "You do. Entries and images belong to your workspace, and a full export is part of what we are building before early access ends.",
  },
  {
    q: "Is Flowforge ready today?",
    a: "Flowforge is in early access. Workspaces and teams are ready now, and the content editor and publishing are arriving in stages.",
  },
];

export default function Home() {
  return (
    <div data-page="home" className="flex flex-col">
      <section aria-labelledby="hero-title" className="relative isolate overflow-hidden">
        <HeroShapes className="absolute inset-0 -z-10 h-full w-full" />
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-10 px-4 pt-6 pb-20 text-center sm:px-6 sm:pt-8 sm:pb-28 lg:px-8">
          <HeroFlow className="w-full max-w-3xl text-left" />
          <div className="flex flex-col items-center gap-5">
            <p className="text-label font-medium text-fg-secondary">The content engine for modern businesses</p>
            <h1 id="hero-title" className="text-display text-fg lg:text-hero">
              <span className="block">Your business.</span> <span className="block">Your content.</span>{" "}
              <span className="block">Everywhere.</span>
            </h1>
            <p className="max-w-2xl text-section font-normal text-fg-secondary">{DESCRIPTION}</p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link href="#playground" className={buttonClasses({ size: "lg" })}>
                Explore Flowforge
              </Link>
              <Link href="#workflow" className={buttonClasses({ variant: "ghost", size: "lg" })}>
                See how it works
              </Link>
            </div>
            <p className="text-body text-fg-secondary">One platform. Multiple experiences. Complete control.</p>
          </div>
          <div
            data-testid="sub-banner"
            className="glass flex w-full max-w-3xl flex-col items-center gap-3 rounded-xl px-6 py-5 sm:flex-row sm:justify-between sm:rounded-full sm:py-4 sm:text-left"
          >
            <p className="text-body font-medium text-fg">
              From your first location to your next hundred, your content grows with you.
            </p>
            <p className="flex-none text-label text-fg-secondary">Websites · Phone apps · One place to edit</p>
          </div>
        </div>
      </section>

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-32 px-4 sm:gap-40 sm:px-6 lg:px-8">
        <BusinessCards />
        <Channels />

        <section id="playground" aria-labelledby="playground-title" className="flex scroll-mt-28 flex-col gap-8">
          <SectionHeading
            id="playground"
            eyebrow="Try it"
            title="Edit once. See it everywhere."
            intro="Pick a business and change its page. The website and the app update as you type, and Publish sends the change to both."
          />
          <Playground />
        </section>

        <Structure />
        <Dashboard />
        <Workflow />
        <Scale />
        <Why />

        <section aria-labelledby="questions-title" className="grid gap-10 lg:grid-cols-[1fr_2fr]">
          <h2 id="questions-title" className="text-page text-fg sm:text-display">Questions</h2>
          <div className="flex flex-col">
            {QUESTIONS.map((item) => (
              <details key={item.q} className="group border-t border-line-strong">
                <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-3 text-title text-fg [&::-webkit-details-marker]:hidden">
                  {item.q}
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true" className="flex-none text-fg-secondary transition-transform duration-[120ms] group-open:rotate-45 motion-reduce:transition-none">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                </summary>
                <p className="max-w-xl pb-5 text-body text-fg-secondary">{item.a}</p>
              </details>
            ))}
          </div>
        </section>

        <Closing />
      </div>
    </div>
  );
}
