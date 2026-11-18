import { buttonClasses, StatusMark } from "@flowforge/ui";
import type { Metadata } from "next";
import Link from "next/link";
import { EditorDemo } from "@/components/marketing/demo/editor-demo";
import {
  HeroFlow,
  HeroShapes,
  ModelIllustration,
  PublishIllustration,
  WriteIllustration,
} from "@/components/marketing/illustrations";

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

const secondaryLink = buttonClasses({ variant: "secondary", size: "lg" });

const STEPS = [
  {
    title: "Describe your content",
    text: "Say what a menu item, a post or a product is made of: a title, a price, a photo. Flowforge builds the editor from that.",
    Illustration: ModelIllustration,
  },
  {
    title: "Write it once",
    text: "Your team writes in one place. Drafts stay private until they are ready, and every page that needs the words uses the same copy.",
    Illustration: WriteIllustration,
  },
  {
    title: "Publish everywhere",
    text: "One press of Publish updates your website and your app together. Nothing goes out of step.",
    Illustration: PublishIllustration,
  },
];

const AUDIENCES = [
  {
    who: "Cafés and restaurants",
    what: "Menus, opening hours and specials that change with the week.",
    example: "Spring menu, now serving",
  },
  {
    who: "Studios and publishers",
    what: "Articles, notes and portfolios with an editor everyone can use.",
    example: "Notes from the print room: risograph in three colours",
  },
  {
    who: "Shops",
    what: "Product pages and collections that read the same on every screen.",
    example: "The linen apron, back in oat and charcoal",
  },
];

const ROLES = [
  { role: "Owner", does: "Runs the workspace and its billing." },
  { role: "Admin", does: "Invites people and sets up content." },
  { role: "Editor", does: "Reviews and publishes anyone's work." },
  { role: "Author", does: "Writes and edits their own drafts." },
  { role: "Viewer", does: "Reads everything, changes nothing." },
];

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
      <section id="workflow" aria-labelledby="how-title" className="flex scroll-mt-28 flex-col gap-10">
        <h2 id="how-title" className="text-page text-fg sm:text-display">How it works</h2>
        <ol aria-label="How it works" className="grid gap-10 md:grid-cols-3">
          {STEPS.map(({ title, text, Illustration }, index) => (
            <li key={title} className="flex flex-col gap-4 border-t border-line-strong pt-6">
              <Illustration />
              <h3 className="text-section text-fg">
                <span className="mr-2 text-fg-secondary tabular-nums">{index + 1}.</span>
                {title}
              </h3>
              <p className="max-w-80 text-body text-fg-secondary">{text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section id="playground" aria-labelledby="demo-title" className="flex scroll-mt-28 flex-col gap-8">
        <div className="flex max-w-2xl flex-col gap-3">
          <h2 id="demo-title" className="text-page text-fg sm:text-display">Try it: write something, then publish</h2>
          <p className="text-body text-fg-secondary">
            Change the sample page below. The website and the phone show your
            words as you type, and Publish makes them live on both.
          </p>
        </div>
        <EditorDemo />
      </section>

      <section id="product" aria-labelledby="who-title" className="grid scroll-mt-28 gap-10 lg:grid-cols-[1fr_2fr]">
        <h2 id="who-title" className="text-page text-fg sm:text-display">Made for businesses that publish every week</h2>
        <ul className="flex flex-col">
          {AUDIENCES.map((item) => (
            <li key={item.who} className="grid gap-2 border-t border-line-strong py-6 sm:grid-cols-[1fr_1.4fr] sm:gap-8">
              <div className="flex flex-col gap-1">
                <h3 className="text-title text-fg">{item.who}</h3>
                <p className="text-body text-fg-secondary">{item.what}</p>
              </div>
              <p className="font-serif text-article-title text-fg">{item.example}</p>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="teams-title" className="glass grid gap-10 rounded-lg p-6 sm:p-10 lg:grid-cols-2">
        <div className="flex flex-col gap-4">
          <h2 id="teams-title" className="text-page text-fg sm:text-display">Built for the whole team</h2>
          <p className="max-w-md text-body text-fg-secondary">
            Everyone gets the access their job needs. Every entry shows where it
            stands, so nobody publishes by accident.
          </p>
          <ul aria-label="Where an entry stands" className="mt-2 grid grid-cols-[auto_1fr] gap-x-5 gap-y-3 text-body">
            {(
              [
                ["draft", "Only your team can see it"],
                ["changed", "Live, with edits waiting to go out"],
                ["published", "Live on your website and app"],
              ] as const
            ).map(([status, meaning]) => (
              <li key={status} className="col-span-2 grid grid-cols-subgrid items-center">
                <StatusMark status={status} />
                <span className="text-fg-muted">{meaning}</span>
              </li>
            ))}
          </ul>
        </div>
        <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-3 self-center text-body">
          {ROLES.map((item) => (
            <div key={item.role} className="contents">
              <dt className="font-medium text-fg">{item.role}</dt>
              <dd className="text-fg-muted">{item.does}</dd>
            </div>
          ))}
        </dl>
      </section>

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

      <section aria-labelledby="closing-title" className="flex flex-col items-start gap-5 border-t border-line-strong pt-16">
        <h2 id="closing-title" className="max-w-3xl text-page text-fg sm:text-display">
          Start with one page. Your website and app follow.
        </h2>
        <Link href="/signup" className={secondaryLink}>
          Create your workspace
        </Link>
      </section>
      </div>
    </div>
  );
}
