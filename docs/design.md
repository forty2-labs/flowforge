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

- **Frosted glass over a calm ground.** Panels, the sidebar and floating
  layers are translucent glass over an ambient gradient the app controls.
  The glass is quiet; it frames the work, never competes with it.
- **Ink holds the type.** Deep ink carries text and the sign-in proof panel.
- **One signal says what to do next.** Cobalt marks the primary action and
  nothing else decorative.
- **A highlight marks a number worth seeing.** The lime highlight is for
  counts and trend chips only. It is never an action and never decoration.
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

| Role | Class | Light | Dark | Use |
| --- | --- | --- | --- | --- |
| Ground | `ground` | `#EDF0EF` + soft glows | `#0A0F18` + cobalt glow | The page behind everything. What makes glass visible |
| Glass | `glass` | white at 62% | `#161E2E` at 62% | Panels, the sidebar, the phone top bar |
| Strong glass | `glass-strong` | white at 86% | `#1A2335` at 90% | Menus, dialogs, toasts: layers over other glass |
| Surface | `bg-surface` | `#FFFFFF` | `#121A29` | Inputs and other solid controls |
| Text | `text-fg` | `#0E1726` | `#E8ECF3` | Primary text |
| Signal | `bg-primary` | `#2F43C8` | `#4559E6` | The one primary action per view |
| Link | `a` (base style) | `#2F43C8` | `#A3B0FF` | Links. Separate from the button colour so both themes reach 4.5:1 |
| Highlight | `bg-highlight` | `#D4F25A` | `#D4F25A` | Count pills and trend chips, with `text-on-highlight` |
| AI | `text-ai` | `#6B3BC2` | `#B79AF0` | Only for generated content and AI actions |
| Danger | `bg-danger` | `#B42318` | `#C8372E` | Destructive buttons |

Status colours (`success`, `warning`, `error`, `info`) carry meaning only, and
never appear without a label or glyph. Text meets 4.5:1 (3:1 at 24 px and
above) against the glass as it actually renders: the glass tint blended over
the brightest part of the ground. Check both themes.

## Themes

Light, Dark and System. System follows the device and is the default.

- The choice is saved per device in `localStorage`. A small script in
  `<head>` applies it before the first paint, so the page never flashes the
  other theme. The person changes it in the account menu or in Settings.
- `tokens.css` holds one set of names with light values on `:root` and dark
  values for `[data-theme="dark"]` and for System on a dark device. Components
  never branch on the theme; they use tokens. The `dark:` variant exists only
  for copied shadcn code.
- Every colour token has a dark value, and `theme.ts` has both palettes with
  the same keys.

## Glass

Translucency is the standard surface, used with care:

- **Only over the ground.** Glass sits over the ambient ground the app draws,
  so contrast is known. Never put glass text over photos or customer content.
- **Two strengths.** `glass` for things on the page, `glass-strong` for things
  that float over other glass. Inputs stay solid (`bg-surface`).
- **Solid fallbacks.** Glass turns solid when the browser cannot blur, when the
  person turns on reduced transparency, and when they ask for more contrast.
  Do not remove these rules from `glass.css`.
- **Edges, not shadows.** A panel is defined by its bright inner edge and a
  faint outer hairline. Only menus and dialogs get a shadow.
- **Big figures on tiles.** Dashboard tiles carry a title, one action and one
  large figure in `text-stat`, like a gauge you read at a glance.

### Type

| Token | Face | Size / line | Weight | Use |
| --- | --- | --- | --- | --- |
| `text-display` | Schibsted Grotesk | 40 / 48 | 600 | One per screen at most: onboarding, empty workspace |
| `text-stat` | Schibsted Grotesk | 44 / 48 | 400 | The big figure on a dashboard tile |
| `text-page` | Schibsted Grotesk | 28 / 36 | 600 | Page title |
| `text-section` | Schibsted Grotesk | 18 / 26 | 600 | Section heading |
| `text-title` | Schibsted Grotesk | 15 / 22 | 600 | Row and item titles |
| `text-body` | Schibsted Grotesk | 14 / 20 | 400 | Default text |
| `text-label` | Schibsted Grotesk | 13 / 18 | 500 | Form labels, buttons (sm) |
| `text-helper` | Schibsted Grotesk | 12 / 16 | 400 | Hints, meta. 12 px is the floor |
| `text-control` | Schibsted Grotesk | 16 / 24 | 400 | Text inside inputs and selects. Below 16 px, iOS Safari zooms the page on focus |
| `text-article` | Newsreader | 19 / 32 | 400 | Published content and previews |
| `text-article-display` | Newsreader | 40 / 46 | 500 | A content headline shown large, such as the sign-in proof |
| `text-article-title` | Newsreader | 26 / 34 | 600 | Content titles shown as content |
| `font-mono` | Geist Mono | inherit | 400 | Literal machine values only: URLs, slugs, keys |

Use the named sizes (`text-page`, `text-body`). Never write `text-[13.5px]`.
Figures in tables use `tabular-nums`. Body copy stays under 80 characters per
line.

### Shape, space, elevation, motion

- **Spacing** is a 4 px scale. Page padding is 32 px on desktop, 24 on tablet
  and 16 on phones.
- **Radius** follows hierarchy, not habit: `sm` 4 for badges, `md` 8 for
  buttons and inputs, `lg` 16 for panels and tiles, `xl` 20 for the sidebar,
  dialogs and sheets, `full` for avatars, count pills and the status dot.
- **Elevation:** glass panels have edges and no shadow. Menus and popovers
  get `shadow-menu`, and dialogs get `shadow-dialog`. There are no other
  shadows.
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
- Gradient washes as decoration on panels or buttons, glows around elements,
  glass over content the app does not control, sparkles for AI, emoji as
  icons, stock illustrations in empty states. (The ambient ground is the one
  gradient, and it stays behind everything.)
- Numbered markers (01, 02) on things that are not a sequence.
- A single word in a heading picked out in another colour or italic.
- Cream backgrounds with terracotta accents, or a black page carried by one
  neon accent. The highlight stays small: pills and chips, never large areas.
- Fade-and-slide-up animation on every section as it scrolls in.
- Marketing voice inside the app ("Supercharge your workflow").

## The functional floor

Every screen meets these before it is done. They come from WCAG 2.2 AA and
the WAI-ARIA Authoring Practices.

- **Keyboard:** everything works without a mouse, in a sensible order. Focus
  is always visible: the 2 px ring in `packages/ui/src/base.css`, lighter
  in dark mode so it reaches 3:1.
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

## Components and shadcn

`packages/ui` holds every component. Simple ones (Button, TextField, Badge,
StatusMark, ConfirmDialog, Toast) are our own. Components with hard keyboard
and screen reader behaviour (menus, popovers, comboboxes, date pickers, tabs)
come from [shadcn/ui](https://ui.shadcn.com), which copies Radix-based source
into `packages/ui/src/components`.

- Add one with `npx shadcn@latest add <name>` from `packages/ui`
  (`components.json` is set up there).
- **Restyle it before use**: our tokens, type sizes, radii, glass and
  sentence case. shadcn's default look is never shipped.
- shadcn's colour names (`bg-background`, `text-muted-foreground`, `border-input`…)
  are aliases of our tokens in `tailwind.css`, so copied code follows the
  theme. Our own code uses our names.
- Merge classes with `cn` (alias `cx`). It is configured with our type and
  shadow names; add any new size name to `src/lib/utils.ts`, or `tailwind-merge`
  will treat it as a colour and drop classes.
- A new token name must not collide with an alias: `text-<name>` is both a
  size and a colour utility in Tailwind.
- Icons come from `lucide-react`, which shadcn uses. Keep stroke icons at
  1.8–2 px.
- A Radix menu inside the phone drawer (a modal `<dialog>`) must render
  `inline`, because portalled content sits under the dialog's top layer.

## Mobile

There is no mobile app yet. When one is built:

- It reads colours (light and dark), type sizes, radii and the status glyphs
  from `theme.ts` in `packages/ui`, so the brand is the same on every screen.
- On iOS, translucency comes from the system's own materials: native tab
  bars, navigation bars and sheets (Liquid Glass), not a web imitation. On
  Android, use Material surfaces. Both follow the person's light, dark and
  reduced-transparency settings.
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
3. Check the screen at 390 px and 1440 px wide, in light and dark, using the
   keyboard only, and with reduced motion and reduced transparency turned on.
   Run `npm run test:visual -w @flowforge/web` (it covers both widths and both
   themes) and look at the screenshots in `apps/web/test-results/screens/`.
4. If you make a design choice that later work should follow, add it to
   [Decisions](decisions.md) with its reason and cost.
