"use client";

import { Button, cx, RichTextEditor, TextField } from "@flowforge/ui";
import { useId, useState, type Dispatch, type KeyboardEvent } from "react";
import { BUSINESSES, MAX_ITEMS } from "./businesses";
import { FeaturedImage } from "./images";
import type { Action, State } from "./state";

// The editing side of the playground: a simplified Flowforge entry form.
// "Content" holds the structured fields; "Page text" holds the rich-text
// body. Both tab panels stay mounted, so switching tabs keeps the editor's
// place. Publish sits at the foot, after everything it publishes.

type Tab = "content" | "text";

const control =
  "w-full rounded-lg border border-line-input bg-surface px-3 text-control text-fg";

export function EditorPanel({
  state,
  dispatch,
  onPublish,
}: {
  state: State;
  dispatch: Dispatch<Action>;
  onPublish: () => void;
}) {
  const [tab, setTab] = useState<Tab>("content");
  const ids = useId();
  const sample = BUSINESSES[state.business];
  const { draft } = state;
  const full = draft.items.length >= MAX_ITEMS;
  const edit = (patch: Extract<Action, { type: "edit" }>["patch"]) => dispatch({ type: "edit", patch });

  function onTabKey(event: KeyboardEvent<HTMLButtonElement>) {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const next: Tab = event.key === "Home" ? "content" : event.key === "End" ? "text" : tab === "content" ? "text" : "content";
    setTab(next);
    document.getElementById(`${ids}-tab-${next}`)?.focus();
  }

  return (
    <div data-testid="editor-panel" className="glass-strong flex min-w-0 flex-col gap-5 rounded-xl p-4 shadow-dialog sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <span className="flex flex-col">
          <span className="text-helper text-fg-secondary">Entry</span>
          <span className="text-title text-fg">Home page</span>
        </span>
        <div role="tablist" aria-label="Entry sections" className="flex gap-1 rounded-full bg-sunken p-1">
          {(
            [
              ["content", "Content"],
              ["text", "Page text"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              id={`${ids}-tab-${value}`}
              type="button"
              role="tab"
              aria-selected={tab === value}
              aria-controls={`${ids}-panel-${value}`}
              tabIndex={tab === value ? 0 : -1}
              onClick={() => setTab(value)}
              onKeyDown={onTabKey}
              className={cx(
                "min-h-11 rounded-full px-3 text-label sm:min-h-9 pointer-coarse:min-h-11",
                tab === value ? "bg-surface font-semibold text-fg" : "text-fg-secondary hover:text-fg",
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div id={`${ids}-panel-content`} role="tabpanel" aria-labelledby={`${ids}-tab-content`} hidden={tab !== "content"} className="flex flex-col gap-4">
        <TextField label="Business name" value={draft.name} onChange={(e) => edit({ name: e.target.value })} />
        <TextField
          label="Announcement"
          hint="Shown as a banner. Leave it empty to hide it."
          value={draft.announcement}
          onChange={(e) => edit({ announcement: e.target.value })}
        />
        <TextField label="Headline" value={draft.headline} onChange={(e) => edit({ headline: e.target.value })} />
        <div className="flex flex-col gap-1.5">
          <label htmlFor={`${ids}-description`} className="text-label font-medium text-fg">
            Description
          </label>
          <textarea
            id={`${ids}-description`}
            rows={3}
            value={draft.description}
            onChange={(e) => edit({ description: e.target.value })}
            className={cx(control, "resize-y py-2")}
          />
        </div>

        <div className="flex flex-col gap-2">
          <span id={`${ids}-image`} className="text-label font-medium text-fg">
            Featured image
          </span>
          <div role="radiogroup" aria-labelledby={`${ids}-image`} className="grid grid-cols-3 gap-2">
            {sample.images.map((label, i) => (
              <label
                key={label}
                className={cx(
                  "flex cursor-pointer flex-col gap-1 rounded-lg border p-1",
                  "has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-(--ff-focus-ring)",
                  draft.image === i ? "border-primary" : "border-line hover:border-line-strong",
                )}
              >
                <input
                  type="radio"
                  name={`${ids}-image`}
                  checked={draft.image === i}
                  onChange={() => edit({ image: i as 0 | 1 | 2 })}
                  className="sr-only"
                />
                <FeaturedImage business={state.business} index={i as 0 | 1 | 2} className="aspect-video w-full rounded-md" />
                <span className="truncate px-0.5 text-helper text-fg-secondary">{label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <span id={`${ids}-items`} className="text-label font-medium text-fg">
            {sample.items.plural}
          </span>
          <ul aria-labelledby={`${ids}-items`} className="flex flex-col gap-2">
            {draft.items.map((item, i) => (
              <li key={item.id} className="flex items-center gap-2">
                <input
                  aria-label={`Name of ${sample.items.singular} ${i + 1}`}
                  value={item.name}
                  onChange={(e) => dispatch({ type: "editItem", id: item.id, patch: { name: e.target.value } })}
                  className={cx(control, "h-11 min-w-0 flex-1")}
                />
                <input
                  aria-label={`Price of ${sample.items.singular} ${i + 1}`}
                  inputMode="decimal"
                  value={item.price}
                  onChange={(e) => dispatch({ type: "editItem", id: item.id, patch: { price: e.target.value } })}
                  className={cx(control, "h-11 w-20 flex-none tabular-nums")}
                />
                <button
                  type="button"
                  aria-label={`Remove ${item.name.trim() || `${sample.items.singular} ${i + 1}`}`}
                  onClick={() => dispatch({ type: "removeItem", id: item.id })}
                  className="inline-flex h-11 w-11 flex-none items-center justify-center rounded-full text-fg-secondary hover:bg-sunken hover:text-fg"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                    <path d="M6 6l12 12M18 6L6 18" />
                  </svg>
                </button>
              </li>
            ))}
          </ul>
          <Button
            variant="ghost"
            size="sm"
            aria-disabled={full}
            onClick={() => !full && dispatch({ type: "addItem" })}
            className="self-start aria-disabled:cursor-not-allowed aria-disabled:opacity-60"
          >
            Add {sample.items.singular}
          </Button>
        </div>
      </div>

      <div id={`${ids}-panel-text`} role="tabpanel" aria-labelledby={`${ids}-tab-text`} hidden={tab !== "text"}>
        <RichTextEditor
          key={`${state.business}-${state.version}`}
          label="Page text"
          content={draft.doc}
          onChange={(doc) => edit({ doc })}
          className="max-h-96 min-h-64"
        />
      </div>

      <div className="mt-auto flex items-center justify-end gap-2 border-t border-line pt-4">
        <Button variant="ghost" onClick={() => dispatch({ type: "reset" })}>
          Reset
        </Button>
        {/* aria-disabled, not disabled: a disabled button drops keyboard
            focus to the page the moment it is pressed. */}
        <Button
          onClick={() => state.status === "changed" && onPublish()}
          aria-disabled={state.status !== "changed"}
          className="aria-disabled:cursor-not-allowed aria-disabled:opacity-60"
        >
          Publish
        </Button>
      </div>
    </div>
  );
}
