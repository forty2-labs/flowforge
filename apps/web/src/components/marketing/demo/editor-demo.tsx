"use client";

import {
  BrowserFrame,
  Button,
  cx,
  PhoneFrame,
  plainText,
  RichTextEditor,
  RichTextView,
  StatusMark,
  type JSONContent,
} from "@flowforge/ui";
import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { ACCENTS, PRESET_IDS, PRESETS, type Accent, type DemoContent, type PresetId } from "./presets";

type Status = "published" | "changed";
type Tab = "web" | "phone";

const UNTITLED: JSONContent = {
  type: "doc",
  content: [{ type: "heading", attrs: { level: 1 }, content: [{ type: "text", text: "Untitled" }] }],
};

// The live demo: a real rich-text editor above a website and a phone that
// show what is written. Typing marks the entry "Unpublished changes";
// Publish returns it to "Published", with the ring-to-dot moment on the
// status. Nothing is saved.
export function EditorDemo() {
  const [preset, setPreset] = useState<PresetId>("cafe");
  const [content, setContent] = useState<DemoContent>(PRESETS.cafe.content);
  // Remounts the editor with fresh content on preset change or reset.
  const [editorKey, setEditorKey] = useState(0);
  const [status, setStatus] = useState<Status>("published");
  const [publishCount, setPublishCount] = useState(0);
  const [tab, setTab] = useState<Tab>("web");
  const [announcement, setAnnouncement] = useState("");
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const ids = useId();

  useEffect(() => () => {
    if (typingTimer.current) clearTimeout(typingTimer.current);
  }, []);

  function changed(next: Partial<DemoContent>) {
    setContent((current) => ({ ...current, ...next }));
    setStatus("changed");
    // Announce once typing pauses, so screen readers are not flooded. The
    // text is cleared first so each pause is announced again.
    if (typingTimer.current) clearTimeout(typingTimer.current);
    setAnnouncement("");
    typingTimer.current = setTimeout(() => setAnnouncement("Preview updated"), 800);
  }

  function load(id: PresetId) {
    if (typingTimer.current) clearTimeout(typingTimer.current);
    setPreset(id);
    setContent(PRESETS[id].content);
    setEditorKey((key) => key + 1);
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
  const doc = plainText(content.doc).trim() ? content.doc : UNTITLED;
  const previewLabel = status === "published" ? "Published" : "Preview of unpublished changes";
  const radio = (selected: boolean) =>
    cx(
      "flex min-h-11 cursor-pointer items-center gap-2 rounded-full border px-4 text-body",
      "has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-(--ff-focus-ring)",
      selected ? "border-primary bg-primary-soft text-on-primary-soft" : "border-line-strong bg-raised text-fg hover:bg-sunken",
    );

  return (
    <div className="flex flex-col gap-6">
      <div className="glass-strong grid gap-6 rounded-xl p-5 shadow-dialog sm:p-6 lg:grid-cols-[minmax(0,1fr)_17rem]">
        <RichTextEditor
          key={`${preset}-${editorKey}`}
          label="Page content"
          content={content.doc}
          onChange={(next) => changed({ doc: next })}
          className="max-h-96 min-h-64"
        />

        <div className="flex flex-col gap-5">
          <fieldset className="flex flex-col gap-2">
            <legend className="mb-2 text-label font-medium text-fg">Sample business</legend>
            <div className="flex flex-wrap gap-2">
              {PRESET_IDS.map((id) => (
                <label key={id} className={radio(preset === id)}>
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

          <fieldset className="flex flex-col gap-2">
            <legend className="mb-2 text-label font-medium text-fg">Brand colour</legend>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(ACCENTS) as Accent[]).map((accent) => (
                <label key={accent} className={radio(content.accent === accent)}>
                  <input
                    type="radio"
                    name={`${ids}-accent`}
                    value={accent}
                    checked={content.accent === accent}
                    onChange={() => changed({ accent })}
                    className="sr-only"
                  />
                  <span aria-hidden="true" className={cx("h-4 w-4 rounded-full border border-line-strong", ACCENTS[accent].fill)} />
                  {ACCENTS[accent].label}
                </label>
              ))}
            </div>
          </fieldset>

          <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
            <span data-testid="demo-status">
              <StatusMark key={publishCount} status={status} animate={status === "published" && publishCount > 0} />
            </span>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => load(preset)}>
                Reset
              </Button>
              {/* aria-disabled, not disabled: a disabled button drops keyboard
                  focus to the page the moment it is pressed. */}
              <Button
                onClick={() => status === "changed" && publish()}
                aria-disabled={status === "published"}
                className="aria-disabled:cursor-not-allowed aria-disabled:opacity-60"
              >
                Publish
              </Button>
            </div>
          </div>
          <p role="status" className="sr-only">
            {announcement}
          </p>
        </div>
      </div>

      <div className="flex min-w-0 flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div role="tablist" aria-label="Preview" className="flex gap-1 rounded-full bg-sunken p-1 md:hidden">
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
                  "min-h-11 rounded-full px-4 text-body",
                  tab === value ? "bg-surface font-semibold text-fg" : "text-fg-secondary hover:text-fg",
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
            <p className="sr-only">The sample page as a website. It shows the content above.</p>
            <BrowserFrame address={sample.site}>
              <div data-testid="preview-web" aria-hidden="true" className="flex min-h-110 flex-col">
                <div className="flex items-center justify-between border-b border-line px-6 py-4">
                  <span className="text-title text-fg">{sample.business}</span>
                  <span className="hidden gap-4 text-label text-fg-secondary sm:flex">
                    <span>Home</span>
                    <span>About</span>
                    <span>Visit</span>
                  </span>
                </div>
                <div className="flex flex-1 flex-col gap-4 px-6 py-8 sm:px-10">
                  <span className={cx("h-1 w-12 rounded-full", ACCENTS[content.accent].fill)} />
                  <RichTextView content={doc} />
                  <span className={cx("mt-2 inline-flex h-11 items-center self-start rounded-full px-5 text-body font-semibold text-white", ACCENTS[content.accent].fill)}>
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
            <p className="sr-only">The sample page as an app screen. It shows the content above.</p>
            <PhoneFrame className="w-64">
              <div data-testid="preview-phone" aria-hidden="true" className="flex flex-1 flex-col">
                <div className="border-b border-line px-4 py-3 text-label font-medium text-fg">{sample.business}</div>
                <div className="flex flex-1 flex-col gap-3 px-4 py-4">
                  <span className={cx("h-1 w-8 rounded-full", ACCENTS[content.accent].fill)} />
                  <RichTextView content={doc} size="compact" />
                </div>
                <div className="px-4 pb-2">
                  <span className={cx("flex h-11 items-center justify-center rounded-full text-body font-semibold text-white", ACCENTS[content.accent].fill)}>
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
