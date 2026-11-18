# FLO-56: Landing page redesign and the Flowforge playground

Linear: FLO-56. Ships on the `FLO-54` branch, in the same PR, as separate `FLO-56` commits.

## Intent

The home page today explains Flowforge in a short list of sections. FLO-56 turns it into one story for first-time visitors (cafés, restaurants, retail shops, small businesses): what Flowforge is, how it serves each kind of business, how content flows from one place to every screen, and how simple it is to run. The editor demo becomes the page's centrepiece: a playground where a visitor edits real fields and sees a website and a phone app change.

Success: a visitor understands in the first screen that Flowforge manages content for their website and app from one place, finds their own kind of business on the page, and has played with the editor before they reach the end.

## Goals

- A centred hero built on the existing flow visual.
- A navigation bar that starts compact and becomes a floating glass bar as the page scrolls.
- Eight story sections, one idea each, with miniature UI rather than icons.
- The playground: structured fields plus the rich-text editor, three businesses, website and phone previews, and an animated publish.
- A bigger footer.

## Non-goals

- New pages (Solutions, Resources, docs, blog). Links that have nowhere to go are not shown.
- A real backend for the playground. It is local state; nothing is saved or sent.
- Changes to the signed-in app.

## Anti-goals (a failure even if it works)

- It looks like a generic Tailwind SaaS template: identical glass cards, icon grids, gradient blobs.
- It implies content types, the media library, the dashboard or native apps exist today. Phase 1 (accounts, workspaces, members, roles) is what is built.
- Claims about performance, uptime, security certifications or integrations.
- Motion that delays content or moves on every section.

## Constraints

- **The Ink & Signal rules in docs/design.md stay** (option A, chosen 2026-11-18). That means:
  - the interface is set in Schibsted Grotesk, and published content in Newsreader;
  - eyebrows are sentence case, not all caps;
  - no arrows on buttons;
  - no decorative gradients or glows, beyond the existing `ground` and the hero exception;
  - cobalt is only for the next action.

  The references are used for composition, depth, glass quality and motion, not for type or colour.
- Tokens only. A new token goes into `tokens.css`, `tailwind.css` and `theme.ts`.
- Light, dark and system themes. WCAG 2.2 AA. Layouts that work from 360 px with no sideways scroll. 44 px touch targets. Full keyboard use.
- Reduced motion: everything becomes static or a fade. Reduced transparency keeps the glass fallbacks.
- `/` stays a static page.

## Approaches considered

1. **Framer Motion (`motion`) for all motion.** Springs and viewport reveals come for free. It costs a new dependency of about 30 to 40 kB on the public page, and a second motion style next to the hand-written canvas.
2. **Hand-written: CSS transitions, the existing canvas, and one small `Reveal` helper on IntersectionObserver** (picked). It adds no dependency and matches how `FlowField` and `Tilt` already work. Springs are approximated with `cubic-bezier` easing. The brief says to use Framer Motion only if the project already supports it, and it doesn't.
3. **One canvas scene for the whole page.** It would be visually rich, but it's hard to make accessible and to test, and it fights the "no motion on every section" rule.

## Page, top to bottom

Headings are sentence case. Copy comes from the brief unless marked. Section `h2`s use `text-page sm:text-display`, as they do now.

### 1. Navigation

- **At the top of the page:** a centred bar, at most `max-w-3xl`, sitting almost flush with the ground. It uses the light glass with a hairline border and no shadow, and sits 16 px from the top.
- **Once the page has scrolled about 24 px:** it eases over 300 ms to the full `max-w-6xl`. The glass becomes `glass-strong`, the border `line-strong`, and it gains `shadow-dialog`. The change is a class toggle with transitions on `max-width`, `background-color`, `border-color` and `box-shadow`. A one-pixel sentinel and IntersectionObserver drive it, not a scroll listener.
- **Links:**
  - "Product", "How it works" and "Playground" are anchors on the home page.
  - Then Pricing, About and Contact.
  - On the right: the theme switch, "Sign in" and "Get started".
  - Solutions and Resources are left out because they have no pages.
- **Phones:** the existing compact bar and glass menu, unchanged in behaviour.
- **Other pages** (pricing, about, contact) use the same header. It starts in the scrolled state there, because those pages have no hero.

### 2. Hero

The layout is centred and stacked:

- **Visual:** `HeroFlow` (website, Flowforge hub, phone) gets bigger, about 880 px wide on desktop.
- **Text:** the eyebrow "The content engine for modern businesses", then the `h1` "Your business. Your content. Everywhere." on three lines in `text-hero`. Below it, the supporting description.
- **Buttons:** "Explore Flowforge" (primary, cobalt) leads to `#playground`, and "See how it works" (ghost) leads to `#workflow`. The brief wanted the first button to say Get started; Explore Flowforge goes to the playground instead (my call).
- **Supporting line:** "One platform. Multiple experiences. Complete control." in `text-fg-secondary`.
- **Sub-banner:** below it, a slim `glass` band holding "From your first location to your next hundred, your content grows with you." with three small facts (Websites · Phone apps · One place to edit), shown as plain text, not chips.
- **Background:** `HeroShapes` stays and grows past the hero's bottom edge. There is one new slow layer: the outline path drifts by up to 12 px on a 20 s CSS loop, which is still under reduced motion.
- **Motion:** the flow particles and `Tilt` stay as they are. A gentle float (4 px, 6 s) is added to the frames.

Text sketch, desktop:

```
            [   Flowforge   Product  How it works  Playground  Pricing …   Get started ]

                 ┌──────── website ────────┐   ◉ hub   ┌ phone ┐
                 │                         │ ~~~~~~~~~ │       │
                 └─────────────────────────┘           └───────┘
                       The content engine for modern businesses
                              Your business.
                              Your content.
                              Everywhere.
                   Manage your website and mobile app content …
                     [ Explore Flowforge ]   See how it works
              ┌─ From your first location to your next hundred … ─┐
```

### 3. Built for every kind of business (`#product`)

- **Heading:** "One platform. Endless possibilities."
- **Grid:** four cards in a 2 × 2 grid (one column on phones). They are deliberately not identical:
  - **Café:** a menu list with prices, opening hours and a "Today's special" strip.
  - **Restaurant:** menu categories with dietary marks (V, GF), plus a seasonal menu card and a reservation line.
  - **Retail:** a product grid of three tiles, a collection title and a promotion strip.
  - **Small business:** a services list, a testimonial in Newsreader, and contact details.
- **Inside each card:** a miniature page drawn in HTML with the sample-brand tokens (`sample-forest`, `sample-ocean`, `sample-ink`, plus one new `sample-clay` for the restaurant). Below it are a title and one sentence.
- **Hover (pointer only):**
  - the card lifts by 4 px and its border goes to `line-strong`;
  - the miniature shifts by up to 6 px against the card, for parallax;
  - one extra line of detail fades in.
- **Touch:** nothing is hidden behind hover, so the extra line always shows on touch screens.

### 4. Create once, experience everywhere (`#channels`)

- **Heading:** "Create once. Experience everywhere."
- **Layout:** in the middle is a CMS panel drawn as a real product screen. It shows a sidebar, an entries list (Menu item "Flat white", Product "Linen tote", Article "Spring hours", Business info), and status dots. Around it sit four endpoints: a desktop website, a mobile website, an iOS app and an Android app.
- **Connectors:** SVG paths run from the panel through a small "API" node to each endpoint. When the section enters view, each path draws once with `stroke-dashoffset` (600 ms each, staggered by 120 ms). After that, one dot travels each path every few seconds, and it pauses off screen.
- **Phones:** the panel stacks above a 2 × 2 grid of endpoints, joined by short straight connectors.
- **Honesty:** a caption under the iOS and Android endpoints reads "Native apps read the same content through the API. SDKs are on the roadmap." (my wording, to settle with you).

### 5. Your content, your structure (`#structure`)

- **Heading:** "Your content. Your structure. Your rules."
- **Left side:** the heading, the description and three benefits:
  - Fields you name.
  - Types for each part of your business.
  - Change the structure without a rebuild.
- **Right side:** a content-type builder mock with a café / retail switch (a radio group).
  - **Café:** "Menu item" with Name, Description, Price, Category, Image, Dietary information and Availability.
  - **Retail:** "Product" with Name, Description, Price, Images, Variants, Category and Stock status.
  - Each field row shows a type badge (Text, Rich text, Number, Image, Choice, Toggle).
  - Switching cross-fades the rows and staggers them by 30 ms.
- **Honesty:** a small "Coming in the next release" note in `text-fg-secondary` sits in the mock's header, because content types are phase 2.

### 6. Powerful underneath, simple on the surface (`#dashboard`)

- **Contrast section:** the section is wrapped in `data-theme="dark"` so the tokens flip to graphite, whichever theme the page is in. This needs the dark token block to also match a nested `[data-theme="dark"]` element, not only `:root`. That is a small `tokens.css` change, recorded in decisions.md.
- **Dashboard:** a large preview inside a `glass-strong` frame, showing:
  - the sidebar, with a workspace selector and Content types, Entries, Media and Team;
  - an entries table with status dots;
  - a Publish button and a Preview tab.
- **Annotations:** four glass notes are pinned to their parts: "Organised content", "Reusable structures", "Central media" and "Instant publishing".
- **Motion:** this is one of the three scroll reveals on the page. The frame fades in and rises 16 px, then the annotations appear one after another, 150 ms apart.
- **Phones:** a cropped view of the entries list with the annotations listed below it, not shrunk.
- **Honesty:** the same "Coming in the next release" note as section 5. Team, workspaces and roles are real today, so those parts carry no note.

### 7. From idea to published (`#workflow`)

- **Heading:** "Your workflow, without the complexity."
- **Steps:** three columns, Structure, Create and Publish. Each step has a small UI vignette:
  - **Structure:** a field list.
  - **Create:** an entry form with an image slot.
  - **Publish:** a status changing from ring to dot. This reuses `StatusMark`.
- **Path:** an SVG path joins the three steps and draws as the section scrolls into view. This is the second scroll reveal. On phones it becomes a vertical timeline, with the path running down the left side.

### 8. Start small, scale without starting over (`#scale`)

- **Heading:** "Start small. Scale without starting over."
- **Visual:** a layered composition in five stages:
  1. one café website;
  2. a phone app is added;
  3. a second location;
  4. a retail shop;
  5. all of them hanging from one workspace.
- **Controls:** a five-step control (a radio group styled as a segmented track) moves through the stages. Each stage adds a frame and a connector. The control is keyboard operable, and the visual is static under reduced motion.
- **Copy:** this section makes no performance claims.

### 9. Why Flowforge

- **Heading:** "More freedom. Less complexity."
- **Layout:** an editorial two-column list of the six advantages from the brief. Each has a short title and one sentence, separated by hairlines. There are no cards.
- **Accuracy:** roles and workspaces get the "available now" wording. The rest is worded as how the product works.

### 10. Questions

The current FAQ stays, trimmed to five questions.

### 11. Final call to action

- **Heading:** "Your next digital experience starts here."
- **Text and buttons:** the supporting line, then "Get started" (primary) and "Explore the platform" (ghost, to `#playground`).
- **Container:** a large `glass-strong` panel over a second `HeroShapes` variant, mirrored, so the page closes the way it opened. This needs a design.md line that extends the "hero exception" to the closing panel.

### 12. Footer

- **Columns:**
  - **Product:** Overview, Features, How it works, Pricing.
  - **Solutions:** Cafés, Restaurants, Retail, Small businesses. These are anchors to `#product`.
  - **Resources:** Documentation, Guides, API reference, Blog. They are shown as plain text with "Coming soon", not links, because they have no pages.
  - **Company:** About, Contact, Privacy, Terms.
- **Below the columns:** the wordmark, "Flexible content infrastructure for every digital experience.", and the existing social links (still placeholders).

## The playground (`#playground`)

- **Heading:** "Edit once. See it everywhere." It sits after section 4, so the visitor plays right after seeing the idea.
- **Order:** the brief didn't settle where the playground goes. Two options:
  - after section 4 (my call);
  - after the hero, which reads well but pushes the business cards down.

### Layout

- **Desktop (lg and wider):**
  - A three-part composition: the editor panel takes 1/3 on the left, and the website preview and phone preview share the other 2/3.
  - Thin SVG connectors run from the editor's right edge to each preview.
  - A slim control bar sits above everything: the business switch, the preview switch (Both, Website, Phone; mainly for tablet), and the status mark.
- **Tablet (md):** the editor sits on top, with the two previews side by side below it. This is today's layout.
- **Phones:** the editor first, then a Website / Phone segmented control and one preview. The previews are not shrunk.

### Editor panel

- **Tabs:** two, "Content" and "Page text".
- **"Content" fields:**
  - Business name (text).
  - Announcement banner (text, can be left empty).
  - Hero headline (text).
  - Description (textarea).
  - Featured image: a choice of three drawn images per business, built from SVG and sample tokens, not photos. It works as a radio group of thumbnails.
  - Menu items or products: a repeater of three to five rows (name and price), with Add and Remove.
- **"Page text":** the existing Tiptap `RichTextEditor` for the body copy.

The editor uses no Framer Motion. It reuses `RichTextEditor`, `RichTextView`, `BrowserFrame`, `PhoneFrame`, `StatusMark` and the preset model.

### Businesses

Café (Harbour Café), Restaurant (new: Olive & Ember, `sample-clay`) and Retail (the existing shop). The studio preset is dropped. Each business brings:

- its own content structure: the café and restaurant have menu items, the retail shop has products with prices;
- sample data;
- an accent colour;
- a preview layout: the café uses a menu list, the restaurant menu categories, and retail a product grid.

Switching businesses cross-fades the previews (200 ms).

### State

- **State model:** one `useReducer` holds the business, the draft content, the published content and the status.
- **Live previews:** the previews always show the draft, so editing feels live. A label above them says "Unpublished changes" or "Published".
- **Reset:** reloads the business's sample.

### Publish

1. Publish is cobalt and carries `aria-disabled` when there is nothing to publish.
2. Pressing it sets the status to "Publishing…" for about 900 ms.
3. A dot runs along each connector from the editor to each preview, using SVG `offset-path` or `stroke-dashoffset`.
4. The previews' status rings fill.
5. The status becomes "Published to website and app".
6. A `role="status"` message says: "Published in this demo. Nothing was sent."

Under reduced motion, the status changes without the travel.

## Shared building blocks

These go in `packages/ui` when more than one screen needs them. Otherwise they go in `apps/web/src/components/marketing`.

- **`Reveal`** (marketing): wraps a child and sets `data-shown` once, when it first enters the viewport. The transition itself is CSS. It is used in three places only: channels, dashboard and workflow.
- **`Connector`** (marketing): an SVG path between two anchored elements, with draw-in and travelling-dot modes. It shares the offset logic with `FlowField`.
- **`SectionHeading`** (marketing): the eyebrow (optional, sentence case), the `h2` and the intro, so every section's heading matches.
- **`BrowserFrame` and `PhoneFrame`:** reused as they are.
- **Buttons:** `buttonClasses` as it is. "Glass card" is not a new component: the existing `glass` and `glass-strong` utilities stay.
- **New tokens:** `sample-clay` only, plus the nested dark scope.

## Testing

- **public-site.spec.ts:**
  - Update the hero and demo tests.
  - Add tests for the header's scrolled state, the business card content, the content-type switch, the scale stepper, and the playground: each field updates both previews, the business switch, add and remove rows, the image choice, the publish sequence and its announcement, and keyboard-only use.
  - Add a reduced-motion run, and a 360 px sideways-scroll check for each section.
- **screens.spec.ts:** the existing sweep covers the new home page at 390 and 1440 px, in light and dark, with axe. The dark nested section must pass contrast in both page themes.
- **Lint, typecheck, test and build** must pass, and `/` must stay static.

## Commits

1. `FLO-56` header scroll states, centred hero and sub-banner.
2. `FLO-56` story sections: business cards, channels, structure, dashboard, workflow, scale, why.
3. `FLO-56` playground: fields, businesses, publish animation.
4. `FLO-56` footer, docs (design.md, decisions.md) and the PR description update.

## Left to the builder

- The exact copy for the one-line card details and the vignettes.
- The drawn featured images.
- The exact easing curves and timings, within the limits above.

## Calls I made (please check)

1. Option A: the Ink & Signal rules stay.
2. No Framer Motion. Motion is hand-written with CSS and IntersectionObserver.
3. Solutions and Resources are left out of the nav. In the footer, Resources shows "Coming soon" as plain text, not links.
4. The hero's main button is "Explore Flowforge", and it goes to the playground.
5. The playground sits after the channels section.
6. The restaurant replaces the studio preset, and the featured images are drawn, not photos.
7. Planned features get a "Coming in the next release" note.
8. The dashboard section is dark in both themes, through a nested `data-theme`.
