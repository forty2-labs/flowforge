# Public site and landing page (FLO-54)

## Intent

First-time visitors and prospective clients arrive at Flowforge knowing
nothing about it. The public site shows them what Flowforge does for a
business: write content once, and it appears on the website and in the app.
Its centrepiece is an interactive demo that lets a visitor try that instead
of reading about it. Success is a visitor who understands the product within
one scroll, plays with the demo, and signs up or gets in touch.

## Goals

- A home page, plus Pricing, About and Contact pages, in the Ink & Signal
  glass style the app already uses.
- An interactive demo: a sample page editor beside a website preview and a
  phone preview, both updating as the visitor types.
- Light, dark and system themes with a visible switch.
- Original illustrations and social media links.
- Simple, quick to read, keyboard-accessible, and working from 360 px.

## Non-goals

- A contact form that sends messages. That is FLO-55. The Contact page shows
  an email address and social links only.
- Billing or real plan enforcement. Pricing is presentational.
- A blog, changelog, docs site, legal page content beyond placeholders, or
  a CMS-driven marketing site (Flowforge cannot render sites yet).
- Analytics or cookie banners.

## Anti-goals

These would make it a failure even if it works:

- It looks like a generic SaaS template: gradient hero, glow blobs, a grid of
  identical feature cards, sections fading in on scroll, "Supercharge"
  copy. Every rule in [docs/design.md](../../design.md) applies.
- The demo is a video or screenshot. It must respond to the visitor.
- The page promises features as if they shipped today. Copy describes what
  Flowforge is for, and the pricing plans are marked as early access.
- Signed-in people lose their current behaviour: visiting `/` still takes
  them to their workspace.

## Constraints

- Next.js 16 with `cacheComponents` on. Read the relevant guide in
  `node_modules/next/dist/docs/` before writing routing or proxy code.
- Tokens only, both themes, glass only over the ground, the functional floor
  in docs/design.md (WCAG 2.2 AA, 44 px targets, visible focus).
- Shared components go in `packages/ui`. New tokens go into `tokens.css`,
  `tailwind.css` and `theme.ts` together.
- No client JavaScript where a server component will do.

## Approaches

| | Approach | Trade-off |
| --- | --- | --- |
| **A (chosen)** | A `(marketing)` route group inside `apps/web` | Reuses fonts, tokens, glass, theme script and components. The site deploys with the app. |
| B | A separate `apps/site` Next.js app | Independent deploys, but duplicates the setup and adds a second Vercel project for four pages. |
| C | A hosted builder or a static page | Dropped: it cannot share tokens or components and would drift from the app. |

The person chose A.

## Design

### Routes

| Path | Page |
| --- | --- |
| `/` | Home, for signed-out visitors |
| `/pricing` | Pricing |
| `/about` | About |
| `/contact` | Contact |

They live in `apps/web/src/app/(marketing)/` with a shared layout holding
the site header and footer. All four are static server components, so they
need no loading boundary.

**Signed-in people at `/`.** Today `app/page.tsx` looks up the session and
redirects. A session lookup inside the home page would make it dynamic and
show signed-in people a flash of the landing page while the redirect
streams. Instead, a `proxy.ts` (Next 16's name for middleware) checks only
whether the `ff_session` cookie is present on a request for `/`, and
redirects to `/start`. Without the cookie, `/` renders the static home page.

`/start` is a route handler, not a page, because it may need to delete a
cookie (builder's call, settled after review). It looks up the session:

- Valid session: redirect to the first workspace, or to `/workspaces/new`
  (today's logic).
- Cookie present but the API answers 401 (session revoked or expired early):
  delete `ff_session` and redirect to `/`, so a lapsed visitor sees the home
  page instead of being stuck on sign-in. No loop is possible, because the
  cookie is gone.

Places that currently send people to `/` after sign-in, workspace creation
or email verification (for example the link in `verify-email.tsx`) should be
checked and pointed at `/start` where they mean "into the app".

**Signed-in people on other marketing pages** see the same static header
with "Sign in" and "Get started" (builder's call). Keeping the pages static
matters more than a personalised header; the wordmark still takes them into
the app through `/`.

### Shared chrome

- **Header:** wordmark linking to `/`, links to Pricing, About and Contact,
  the theme switch, "Sign in" (a link) and "Get started" (the one primary
  button, to `/signup`). Below 768 px the page links collapse into a menu
  using the same pattern as the app's mobile nav.
- **Theme switch:** a compact control cycling Light, Dark and System, built
  on the existing `setTheme`/`useTheme` in `apps/web/src/lib/theme.ts`. Its
  accessible name states the current choice.
- **Footer:** page links, social links (each an icon with a visible or
  accessible label), contact email, a copyright line with the year from
  `Intl`/`Date`, and links to Privacy and Terms that point to placeholder
  pages saying the text is coming.
- Placeholder social handles, contact email and team names live in one file,
  `apps/web/src/lib/site.ts`, to replace in one place later.

### Home page sections

1. **Hero.** A plain headline and one sentence on what Flowforge does, with
   "Get started" and "See it work" (scrolls to the demo). Beside it, a
   static illustration: one entry set as a page proof with crop marks,
   flowing to a website frame and a phone frame. On phones the illustration
   sits below the text.
2. **How it works.** Three steps that really are a sequence: describe your
   content, write it once, publish everywhere. Each has a small
   illustration. Steps may be numbered because they are a sequence.
3. **The demo** (below).
4. **Who it's for.** Cafés, studios and shops, each a short sentence and a
   line of example content set in Newsreader. A list, not three identical
   cards.
5. **Built for teams.** Roles and the draft-to-published lifecycle, shown
   with the real `StatusMark` glyphs.
6. **Questions.** A short FAQ using native `<details>`/`<summary>`.
7. **Closing call.** One sentence and "Get started".

### The demo

A client component, the only substantial client code on the site.

- **Editor panel (glass):** a preset switch (Café, Studio, Shop), then real
  labelled inputs for title, a short body and an accent choice from a small
  fixed set of token colours, and a "Publish" button. The status uses
  `StatusMark` and follows the real lifecycle in docs/design.md:
  - A preset starts **Published** (filled dot).
  - Any edit makes it **Unpublished changes** (dot inside a ring).
  - Publish returns it to **Published**, with the designed ring-fills-to-dot
    animation.
  - Switching preset or pressing reset loads that preset as Published.
  - "Draft" (empty ring) is not used, since the sample was never unpublished.
- **Website preview:** a browser frame with a fake address bar in mono,
  rendering the content as a small site page in Newsreader.
- **Phone preview:** a phone frame rendering the same content as an app
  screen.
- Previews show the working copy as the visitor types, with a small label
  matching the status: "Published" or "Preview of unpublished changes".
  This teaches the lifecycle in one interaction. The live region announces
  status changes ("Published") as well as preview updates.
- Previews are `aria-hidden` mirrors with a polite live region announcing
  "Preview updated" at most after typing pauses, so screen reader users are
  not flooded.
- Nothing is saved or sent. A reset link restores the preset.
- Layout: three columns at wide widths; at tablet, the editor on top with
  the two previews side by side; on phones, the editor then a tab switch
  between Website and Phone previews (ARIA tabs pattern).
- The browser and phone frames are generic, so they go in `packages/ui` as
  `BrowserFrame` and `PhoneFrame`.
- The preview content inside the frames is customer-style content, so it is
  drawn on solid surfaces, not glass.

### Pricing

Three plans marked "Early access pricing": a free plan for one small site, a
paid plan for a growing business, and a custom plan for agencies. Names,
prices and limits live in `apps/web/src/lib/pricing.ts` as placeholders.
Paid buttons go to `/signup`; the custom plan goes to `/contact`. Below the
plans, a comparison table (scrolling inside its own box on phones) and a
short pricing FAQ. Prices are formatted with `Intl.NumberFormat`.

### About

Why Flowforge exists (one business, many places its words appear), the
principles from docs/design.md in plain words (content looks like content,
one clear action, accessible by default), and a team list from `site.ts`
with initials avatars from `packages/ui`.

### Contact

The contact email as a `mailto:` link, the social links, and a line saying
when to expect a reply. No form (FLO-55).

### Illustrations

Original inline SVG components in `apps/web/src/components/marketing/`,
drawn only with `currentColor` and token CSS variables so they follow the
theme. The motifs come from the product: page proofs with crop marks, the
draft ring and published dot, browser and phone outlines, lines of text set
as content. No stock art, no emoji, no gradients beyond the ground. Each is
decorative (`aria-hidden`) unless it carries meaning.

### Motion

Only in response to the visitor: hover and press (120 ms), the demo's
publish dot, the preview updating. No scroll-triggered animation. Under
reduced motion, the publish dot appears without animating.

### Metadata

Each page sets its own `title` and `description`. The home page adds Open
Graph title and description. Absolute URLs come from `metadataBase`, read
from a new `SITE_URL` env var (added to `.env.example`, falling back to
`http://localhost:3000`), since the production domain is not settled. A
share image is out of scope for this issue (builder's call).

### Testing

- Extend `apps/web/e2e/screens.spec.ts`: visit `/`, `/pricing`, `/about` and
  `/contact` signed out at both widths and both themes, run the same axe and
  sideways-scroll checks, and save screenshots. Exercise the demo: type a
  title, check both previews show it, press Publish, check the status reads
  "Published".
- Exercise the demo's lifecycle: edit (Unpublished changes), Publish
  (Published), reset (Published with preset content).
- Add a check that a signed-in visitor to `/` lands in their workspace, and
  that a visitor with an invalid `ff_session` cookie lands on the home page
  with the cookie cleared.

### Decisions to record

Add to [docs/decisions.md](../../decisions.md): the public site lives in a
route group in the web app (reason and cost from Approaches), and `/`
splits on cookie presence in the proxy.

## Left to the builder

- Exact copy, within the voice rules in docs/design.md.
- Exact illustration drawings, within the motifs above.
- Preset content for the three demo businesses.
- Placeholder plan names, prices and limits.
- Which lucide icons to use for social links (or simple custom marks where
  lucide has none).
- Whether any new tokens are needed (for example frame chrome); if so, add
  them in all three token files.
