"use client";

import { BrowserFrame, Button, cx, PhoneFrame, StatusMark, TextField } from "@flowforge/ui";
import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { ACCENTS, PRESET_IDS, PRESETS, type Accent, type DemoContent, type PresetId } from "./presets";

type Status = "published" | "changed";
type Tab = "web" | "phone";

// A sample entry beside a website and a phone showing it. Edits show in both
// previews straight away and mark the entry "Unpublished changes"; Publish
// returns it to "Published" with the ring-to-dot moment. Nothing is saved.
export function EditorDemo() {
  const [preset, setPreset] = useState<PresetId>("cafe");
  const [content, setContent] = useState<DemoContent>(PRESETS.cafe.content);
  const [status, setStatus] = useState<Status>("published");
  const [publishCount, setPublishCount] = useState(0);
  const [tab, setTab] = useState<Tab>("web");
  const [announcement, setAnnouncement] = useState("");
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const ids = useId();

  useEffect(() => () => {
    if (typingTimer.current) clearTimeout(typingTimer.current);
  }, []);

  function edit(change: Partial<DemoContent>) {
    setContent((current) => ({ ...current, ...change }));
    setStatus("changed");
    // Announce once typing pauses, so screen readers are not flooded.
    if (typingTimer.current) clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => setAnnouncement("Preview updated"), 800);
  }

  function load(id: PresetId) {
    if (typingTimer.current) clearTimeout(typingTimer.current);
    setPreset(id);
    setContent(PRESETS[id].content);
    setStatus("published");
    setPublishCount(0);
    setAnnouncement(`${PRESETS[id].label} sample loaded`);
  }

  function publish() {
    if (typingTimer.current) clearTimeout(typingTimer.current);
    setStatus("published");
    setPublishCount((count) => count + 1);
    setAnnouncement("Published");
  }

  function onTabKey(event: KeyboardEvent<HTMLButtonElement>) {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const next: Tab =
      event.key === "Home" ? "web" : event.key === "End" ? "phone" : tab === "web" ? "phone" : "web";
    setTab(next);
    document.getElementById(`${ids}-tab-${next}`)?.focus();
  }

  const sample = PRESETS[preset];
  const title = content.title.trim() || "Untitled";
  const previewLabel = status === "published" ? "Published" : "Preview of unpublished changes";

  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-[minmax(0,22rem)_minmax(0,1fr)_auto]">
      <div className="glass flex min-w-0 flex-col gap-5 rounded-lg p-5 md:col-span-2 xl:col-span-1">
        <fieldset className="flex flex-col gap-2">
          <legend className="mb-2 text-label font-medium text-fg">Sample business</legend>
          <div className="flex flex-wrap gap-2">
            {PRESET_IDS.map((id) => (
              <label
                key={id}
                className={cx(
                  "flex min-h-11 cursor-pointer items-center rounded-md border px-3 text-body",
                  "has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-(--ff-focus-ring)",
                  preset === id
                    ? "border-primary bg-primary-soft text-on-primary-soft"
                    : "border-line-strong bg-raised text-fg hover:bg-sunken",
                )}
              >
                <input
                  type="radio"
                  name={`${ids}-preset`}
                  value={id}
                  checked={preset === id}
                  onChange={() => load(id)}
                  className="sr-only"
                />
                {PRESETS[id].label}
              </label>
            ))}
          </div>
        </fieldset>

        <TextField
          label="Title"
          value={content.title}
          onChange={(event) => edit({ title: event.target.value })}
          maxLength={200}
        />

        <div className="flex flex-col gap-1.5">
          <label htmlFor={`${ids}-body`} className="text-label font-medium text-fg">
            Body
          </label>
          <textarea
            id={`${ids}-body`}
            rows={4}
            maxLength={400}
            value={content.body}
            onChange={(event) => edit({ body: event.target.value })}
            className="resize-y rounded-lg border border-line-input bg-surface px-3 py-2.5 text-control text-fg"
          />
        </div>

        <fieldset className="flex flex-col gap-2">
          <legend className="mb-2 text-label font-medium text-fg">Accent colour</legend>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(ACCENTS) as Accent[]).map((accent) => (
              <label
                key={accent}
                className={cx(
                  "flex min-h-11 cursor-pointer items-center gap-2 rounded-md border px-3 text-body",
                  "has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-(--ff-focus-ring)",
                  content.accent === accent
                    ? "border-primary bg-primary-soft text-on-primary-soft"
                    : "border-line-strong bg-raised text-fg hover:bg-sunken",
                )}
              >
                <input
                  type="radio"
                  name={`${ids}-accent`}
                  value={accent}
                  checked={content.accent === accent}
                  onChange={() => edit({ accent })}
                  className="sr-only"
                />
                <span aria-hidden="true" className={cx("h-4 w-4 rounded-full border border-line-strong", ACCENTS[accent].fill)} />
                {ACCENTS[accent].label}
              </label>
            ))}
          </div>
        </fieldset>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
          <span data-testid="demo-status">
            <StatusMark key={publishCount} status={status} animate={status === "published" && publishCount > 0} />
          </span>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => load(preset)}>
              Reset
            </Button>
            <Button onClick={publish} disabled={status === "published"}>
              Publish
            </Button>
          </div>
        </div>
        <p role="status" className="sr-only">
          {announcement}
        </p>
      </div>

      <div className="flex min-w-0 flex-col gap-3 md:col-span-2 xl:col-span-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div role="tablist" aria-label="Preview" className="flex gap-1 rounded-md bg-sunken p-1 md:hidden">
            {(["web", "phone"] as const).map((value) => (
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
                  "min-h-11 rounded-sm px-4 text-body",
                  tab === value ? "bg-surface font-medium text-fg" : "text-fg-secondary hover:text-fg",
                )}
              >
                {value === "web" ? "Website" : "Phone"}
              </button>
            ))}
          </div>
          <p data-testid="preview-label" className="text-label text-fg-secondary">
            {previewLabel}
          </p>
        </div>

        <div className="grid min-w-0 gap-6 md:grid-cols-[minmax(0,1fr)_auto] md:items-start">
          <div
            id={`${ids}-panel-web`}
            role="tabpanel"
            aria-labelledby={`${ids}-tab-web`}
            className={cx("min-w-0", tab !== "web" && "max-md:hidden")}
          >
            <p className="sr-only">The sample page as a website. It shows the fields above.</p>
            <BrowserFrame address={sample.site} className="h-full">
              <div data-testid="preview-web" aria-hidden="true" className="flex min-h-110 flex-col">
                <div className="flex items-center justify-between border-b border-line px-6 py-4">
                  <span className="text-title text-fg">{sample.business}</span>
                  <span className="hidden gap-4 text-label text-fg-secondary sm:flex">
                    <span>Home</span>
                    <span>About</span>
                    <span>Visit</span>
                  </span>
                </div>
                <div className="flex flex-1 flex-col gap-4 px-6 py-10 sm:px-10">
                  <span className={cx("h-1 w-12 rounded-full", ACCENTS[content.accent].fill)} />
                  <h3 className="font-serif text-article-display text-fg wrap-anywhere">{title}</h3>
                  <p className="max-w-xl font-serif text-article text-fg-secondary wrap-anywhere">{content.body}</p>
                  <span className={cx("mt-2 inline-flex h-11 items-center self-start rounded-md px-4 text-body font-medium text-white", ACCENTS[content.accent].fill)}>
                    {sample.action}
                  </span>
                </div>
              </div>
            </BrowserFrame>
          </div>

          <div
            id={`${ids}-panel-phone`}
            role="tabpanel"
            aria-labelledby={`${ids}-tab-phone`}
            className={cx("flex min-w-0 justify-center", tab !== "phone" && "max-md:hidden")}
          >
            <p className="sr-only">The sample page as an app screen. It shows the fields above.</p>
            <PhoneFrame>
              <div data-testid="preview-phone" aria-hidden="true" className="flex flex-1 flex-col">
                <div className="border-b border-line px-4 py-3 text-label font-medium text-fg">{sample.business}</div>
                <div className="flex flex-1 flex-col gap-3 px-4 py-5">
                  <span className={cx("h-1 w-8 rounded-full", ACCENTS[content.accent].fill)} />
                  <h3 className="font-serif text-article-title text-fg wrap-anywhere">{title}</h3>
                  <p className="font-serif text-body text-fg-secondary wrap-anywhere">{content.body}</p>
                </div>
                <div className="px-4 pb-2">
                  <span className={cx("flex h-11 items-center justify-center rounded-md text-body font-medium text-white", ACCENTS[content.accent].fill)}>
                    {sample.action}
                  </span>
                </div>
              </div>
            </PhoneFrame>
          </div>
        </div>
      </div>
    </div>
  );
}
