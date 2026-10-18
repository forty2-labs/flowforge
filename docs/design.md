# Design

How Flowforge should look, read and behave, on the web now and in the mobile
app later. Read this before changing anything a person sees. The visual source
of truth is the "Ink & Signal" board in the
[product design package](https://claude.ai/artifact/RkqQHGTZHv4QQcumDyRoqi).
This page records how the code applies it, and where the code deliberately
departs from it.

## The direction: Ink & Signal, sharpened

Flowforge is a tool for people who publish: a café's menu, a studio's blog, a
shop's pages. The interface should feel like a well-run print shop: calm,
exact, and plainly about the work. It must never look like a generic AI or
SaaS template.

- **Ink holds the structure.** The deep ink sidebar and text carry the frame.
- **One signal says what to do next.** Cobalt marks the primary action and
  nothing else decorative.
- **Content looks like content.** Anything a business publishes (entry
  titles, previews, article text) is set in Newsreader. Interface chrome is
  set in Schibsted Grotesk. The difference between the two is the point.
- **The dot is the signature.** The logo ends in a dot: work reaching a
  finished point. The same dot is the lifecycle mark. Draft is an empty ring,
  published is a filled dot. This is the one place the design is loud. Keep
  everything around it quiet.
- **Violet always means AI.** Nowhere else.

## Tokens

Tokens live in three files that must stay in step:

| File | Role |
| --- | --- |
| [packages/ui/src/tokens.css](../packages/ui/src/tokens.css) | The values, as CSS variables |
| [packages/ui/src/tailwind.css](../packages/ui/src/tailwind.css) | Maps the variables to Tailwind class names |
| [packages/ui/src/theme.ts](../packages/ui/src/theme.ts) | Typed copy for code that cannot read CSS, including the future mobile app |

Adding or changing a token means editing all three in the same commit.
Components never contain a hex value, a pixel font size or a one-off shadow.
If a value is missing, add a token.

### Colour

| Role | Token | Value | Use |
| --- | --- | --- | --- |
| Ink | `brand.ink` | `#0E1726` | Sidebar, primary text |
| Signal | `action.primary` | `#2F43C8` | The one primary action per view, links, focus |
| Paper | `bg.app` | `#F4F4F1` | Page ground. A barely warm grey, not cream |
| Surface | `bg.surface` | `#FFFFFF` | Panels, inputs, dialogs |
| Sunken | `bg.sunken` | `#ECECE7` | Wells, hover on surface, disabled fields |
| AI | `ai.accent` | `#6B3BC2` | Only for generated content and AI actions |

Status colours (`success`, `warning`, `error`, `info`) carry meaning only, and
never appear without a label or glyph. Text on any background meets 4.5:1, or
3:1 at 24 px and above.

### Type

| Token | Face | Size / line | Weight | Use |
| --- | --- | --- | --- | --- |
| `text-display` | Schibsted Grotesk | 40 / 48 | 600 | One per screen at most: onboarding, empty workspace |
| `text-page` | Schibsted Grotesk | 28 / 36 | 600 | Page title |
| `text-section` | Schibsted Grotesk | 18 / 26 | 600 | Section heading |
| `text-title` | Schibsted Grotesk | 15 / 22 | 600 | Row and item titles |
| `text-body` | Schibsted Grotesk | 14 / 20 | 400 | Default text |
| `text-label` | Schibsted Grotesk | 13 / 18 | 500 | Form labels, buttons (sm) |
| `text-helper` | Schibsted Grotesk | 12 / 16 | 400 | Hints, meta. 12 px is the floor |
| `text-article` | Newsreader | 19 / 32 | 400 | Published content and previews |
| `text-article-title` | Newsreader | 26 / 34 | 600 | Content titles shown as content |
| `font-mono` | Geist Mono | inherit | 400 | Literal machine values only: URLs, slugs, keys |

Use the named sizes (`text-page`, `text-body`). Never write `text-[13.5px]`.
Figures in tables use `tabular-nums`. Body copy stays under 80 characters per
line.

### Shape, space, elevation, motion

- **Spacing** is a 4 px scale. Page padding is 32 px on desktop, 24 on tablet
  and 16 on phones.
- **Radius** follows hierarchy, not habit: `sm` 4 for badges, `md` 6 for
  buttons and inputs, `lg` 10 for panels, `xl` 14 for dialogs and sheets,
  `full` for avatars and the status dot.
- **Elevation:** panels have a border and no shadow. Menus and popovers get
  `shadow-menu`, and dialogs get `shadow-dialog`. There are no other shadows.
- **Motion** answers what a person did: 120 ms for hover and press, 200 ms
  for menus and toasts, 280 ms for dialogs and drawers. The one designed
  moment is the publish mark: the ring fills to a dot. Under
  `prefers-reduced-motion`, movement becomes a fade or nothing.

## The lifecycle mark

`StatusMark` in `packages/ui` draws every status. Each status has a glyph
and a label, so colour is never the only signal. The labels are the same on
every screen and on mobile.

| Status | Glyph | Colour |
| --- | --- | --- |
| Draft | Empty ring | Muted |
| Published | Filled dot | Success |
| Unpublished changes | Filled dot inside a ring | Warning |
| Archived | Short dash | Muted |
| Pending (invitation) | Empty ring | Info |
| Expired (invitation) | Dashed ring | Muted |

## What makes it look generic, and is not allowed

These are the habits that make an app look machine-made. Do not use them,
even if a component library or a generated suggestion does.

- Geist, Inter, Roboto or Arial as the interface face.
- All-caps, letter-spaced labels above headings or nav groups. Use sentence
  case at `text-label` weight.
- Arrows appended to button or link text (`Continue →`), and chains of chips
  joined by arrows.
- Strings of facts joined by middle dots used as decoration. Give each fact
  its own element, or write a sentence.
- Every block of content in an identical rounded card with the same soft
  shadow. Lists are lists. A panel is for a group you act on together.
- Gradient washes, glows, glass blur, sparkles for AI, emoji as icons, stock
  illustrations in empty states.
- Numbered markers (01, 02) on things that are not a sequence.
- A single word in a heading picked out in another colour or italic.
- Cream backgrounds with terracotta accents, or black backgrounds with one
  neon accent.
- Fade-and-slide-up animation on every section as it scrolls in.
- Marketing voice inside the app ("Supercharge your workflow").

## The functional floor

Every screen meets these before it is done. They come from WCAG 2.2 AA and
the WAI-ARIA Authoring Practices.

- **Keyboard:** everything works without a mouse, in a sensible order. Focus
  is always visible: the 2 px signal ring in `globals.css`.
- **Patterns:** menus, dialogs, tabs and listboxes follow the ARIA Authoring
  Practices: focus moves in on open, Esc closes and returns focus, and arrow
  keys move within a menu. Native elements come first: `<button>`, `<a href>`,
  `<dialog>`, `<select>`, `<label>`.
- **Forms:** every input has a visible label. Errors say what went wrong and
  how to fix it, sit next to the field, and are linked with
  `aria-describedby`.
- **Targets:** 44 × 44 px on touch, at least 24 × 24 px for a pointer.
- **Responsive:** works from 360 px wide with no sideways scroll. Below
  768 px the sidebar becomes a top bar with a menu. Tables scroll inside
  their own box.
- **Feedback:** every action shows its result. Saving shows a toast, a
  pending action shows a loading state, and loading content shows a skeleton
  shaped like the final layout. A destructive action asks first, in a
  `ConfirmDialog`, never `window.confirm`.
- **Performance:** fonts load through `next/font`, so the layout does not
  shift. No client JavaScript where a server component will do.
- **Dates and numbers** are formatted with `Intl`, never by hand.

## Writing in the interface

- Sentence case everywhere. Name things the way a business owner would:
  "Team", not "Members management".
- A button says exactly what happens: "Remove member", not "Confirm". The
  same verb carries through: "Publish" leads to "Published".
- Errors are plain and never apologise: what happened, then what to do.
- An empty screen is an invitation to act, with one clear next step.

## Mobile

There is no mobile app yet. When one is built:

- It reads colours, type sizes, radii and the status glyphs from
  `theme.ts` in `packages/ui`, so the brand is the same on every screen.
- Navigation, sheets and gestures follow each platform's own conventions
  (Apple's Human Interface Guidelines, Material on Android). It is not the
  web app in a shell.
- Text follows the system font size setting (Dynamic Type, font scale).
  Article text starts at 18 px.
- The anti-generic rules and the functional floor above apply unchanged.

## How to work on the interface

1. Read this page, then the matching board in the design package.
2. Build from `packages/ui` components and tokens. If something is missing,
   add it to `packages/ui` instead of styling it in place.
3. Check the screen at 390 px and 1440 px wide, using the keyboard only, and
   with reduced motion turned on. Run `npm run test:visual -w @flowforge/web`
   and look at the screenshots.
4. If you make a design choice that later work should follow, add it to
   [Decisions](decisions.md) with its reason and cost.
