import { BrowserFrame, cx, PhoneFrame, RichTextView } from "@flowforge/ui";
import { BUSINESSES, type BusinessId, type Draft } from "./businesses";
import { FeaturedImage } from "./images";

// The two places the playground's content shows up: a website and an app
// screen. Both render the draft as it is typed. Each business lays its
// items out its own way: a café menu list, restaurant courses, a shop grid.

export const FALLBACK_NAME = "Your business";

type PreviewProps = { business: BusinessId; draft: Draft };

function Items({ business, draft, compact = false }: PreviewProps & { compact?: boolean }) {
  const { layout, accent } = BUSINESSES[business];
  const items = draft.items.filter((item) => item.name.trim() || item.price.trim());
  if (items.length === 0) return null;
  if (layout === "grid") {
    return (
      <ul data-testid="preview-items" className={cx("grid gap-3", compact ? "grid-cols-2" : "grid-cols-3")}>
        {items.map((item, i) => (
          <li key={item.id} className="flex min-w-0 flex-col gap-1.5">
            <span className={cx("aspect-square rounded-md border border-line", i === 0 ? accent : "bg-sunken")} />
            <span className="text-label font-medium text-fg wrap-anywhere">{item.name}</span>
            <span className="text-label text-fg-secondary tabular-nums">{item.price}</span>
          </li>
        ))}
      </ul>
    );
  }
  return (
    <ul data-testid="preview-items" className={cx("flex flex-col", layout === "courses" && !compact && "grid grid-cols-2 gap-x-6")}>
      {items.map((item) => (
        <li key={item.id} className="flex min-w-0 items-baseline justify-between gap-3 border-b border-line py-2">
          <span className={cx("min-w-0 font-serif text-fg wrap-anywhere", compact ? "text-body" : "text-title")}>{item.name}</span>
          <span className="flex-none text-label text-fg-secondary tabular-nums">{item.price}</span>
        </li>
      ))}
    </ul>
  );
}

function Announcement({ business, draft }: PreviewProps) {
  if (!draft.announcement.trim()) return null;
  return (
    <p data-testid="announcement" className={cx("px-4 py-2 text-center text-label font-medium text-white wrap-anywhere", BUSINESSES[business].accent)}>
      {draft.announcement}
    </p>
  );
}

export function WebPreview({ business, draft }: PreviewProps) {
  const sample = BUSINESSES[business];
  const name = draft.name.trim() || FALLBACK_NAME;
  return (
    <BrowserFrame address={sample.site}>
      <div data-testid="preview-web" data-image={draft.image} aria-hidden="true" className="flex min-h-110 flex-col">
        <Announcement business={business} draft={draft} />
        <div className="flex items-center justify-between gap-4 border-b border-line px-6 py-4">
          <span className="min-w-0 text-title text-fg wrap-anywhere">{name}</span>
          <span className="hidden flex-none gap-4 text-label text-fg-secondary sm:flex">
            <span>Home</span>
            <span>{sample.items.plural === "Products" ? "Shop" : "Menu"}</span>
            <span>Visit</span>
          </span>
        </div>
        <FeaturedImage business={business} index={draft.image} className="h-40 w-full" />
        <div className="flex flex-1 flex-col gap-4 px-6 py-6 sm:px-8">
          {draft.headline.trim() && (
            <h3 className="font-serif text-article-display font-medium text-fg wrap-anywhere">{draft.headline}</h3>
          )}
          {draft.description.trim() && <p className="text-body text-fg-secondary wrap-anywhere">{draft.description}</p>}
          <Items business={business} draft={draft} />
          <RichTextView content={draft.doc} size="compact" />
          <span className={cx("mt-auto inline-flex h-11 items-center self-start rounded-full px-5 text-body font-semibold text-white ring-1 ring-line-strong", sample.accent)}>
            {sample.action}
          </span>
        </div>
      </div>
    </BrowserFrame>
  );
}

export function PhonePreview({ business, draft }: PreviewProps) {
  const sample = BUSINESSES[business];
  const name = draft.name.trim() || FALLBACK_NAME;
  return (
    <PhoneFrame className="w-60">
      <div data-testid="preview-phone" data-image={draft.image} aria-hidden="true" className="flex flex-1 flex-col">
        <div className="border-b border-line px-4 py-3 text-label font-medium text-fg wrap-anywhere">{name}</div>
        <Announcement business={business} draft={draft} />
        <FeaturedImage business={business} index={draft.image} className="h-28 w-full" />
        <div className="flex flex-1 flex-col gap-3 px-4 py-4">
          {draft.headline.trim() && (
            <h3 className="font-serif text-article-title font-semibold text-fg wrap-anywhere">{draft.headline}</h3>
          )}
          {draft.description.trim() && <p className="text-label text-fg-secondary wrap-anywhere">{draft.description}</p>}
          <Items business={business} draft={draft} compact />
          <RichTextView content={draft.doc} size="compact" />
        </div>
        <div className="px-4 pb-2">
          <span className={cx("flex h-11 items-center justify-center rounded-full text-body font-semibold text-white ring-1 ring-line-strong", sample.accent)}>
            {sample.action}
          </span>
        </div>
      </div>
    </PhoneFrame>
  );
}
