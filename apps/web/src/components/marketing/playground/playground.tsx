"use client";

import { cx, StatusMark } from "@flowforge/ui";
import { useEffect, useId, useLayoutEffect, useReducer, useRef, useState, type KeyboardEvent, type RefObject } from "react";
import { Connector } from "../home/connector";
import { BUSINESS_IDS, BUSINESSES } from "./businesses";
import { EditorPanel } from "./editor-panel";
import { PhonePreview, WebPreview } from "./previews";
import { initialState, reducer, type Action } from "./state";

// Edit once, see it everywhere. A simplified Flowforge entry on the left
// (a third of the width on wide screens), the website and the phone app it
// feeds on the right, joined by lines. Publish sends a dot along each line
// to each screen, then marks the entry published. It is all local: nothing
// is saved or sent, and the page says so.

type Tab = "web" | "phone";

const PUBLISH_MS = 900;

// Lines from the editor's right edge to the website's left edge and over
// the top of the website to the phone, in the stage's own pixels.
function useLines(
  stage: RefObject<HTMLDivElement | null>,
  editor: RefObject<HTMLDivElement | null>,
  web: RefObject<HTMLDivElement | null>,
  phone: RefObject<HTMLDivElement | null>,
): { toWeb: string; toPhone: string } | null {
  const [lines, setLines] = useState<{ toWeb: string; toPhone: string } | null>(null);
  useLayoutEffect(() => {
    const root = stage.current;
    if (!root) return;
    const measure = () => {
      const [s, e, w, p] = [root, editor.current, web.current, phone.current].map((el) => el?.getBoundingClientRect());
      // Only on wide screens, where the parts sit side by side.
      if (!s || !e || !w || !p || w.left < e.right || p.left < w.right || p.width === 0) return setLines(null);
      const x = (value: number) => Math.round(value - s.left);
      const y = (value: number) => Math.round(value - s.top);
      const sx = x(e.right);
      const sy = y(e.top + 120);
      const wx = x(w.left);
      const wy = y(w.top + 120);
      const mid = Math.round((sx + wx) / 2);
      const over = y(w.top) - 20;
      const px = x(p.left + p.width / 2);
      setLines({
        toWeb: `M${sx} ${sy} C ${mid} ${sy}, ${mid} ${wy}, ${wx} ${wy}`,
        toPhone: `M${sx} ${sy} C ${mid} ${sy}, ${mid} ${over}, ${wx} ${over} L ${px - 20} ${over} Q ${px} ${over}, ${px} ${y(p.top)}`,
      });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(root);
    return () => observer.disconnect();
  }, [stage, editor, web, phone]);
  return lines;
}

export function Playground() {
  const [state, dispatch] = useReducer(reducer, undefined, () => initialState());
  const [tab, setTab] = useState<Tab>("web");
  const [announcement, setAnnouncement] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const ids = useId();
  const stage = useRef<HTMLDivElement>(null);
  const editor = useRef<HTMLDivElement>(null);
  const web = useRef<HTMLDivElement>(null);
  const phone = useRef<HTMLDivElement>(null);
  const lines = useLines(stage, editor, web, phone);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  // Every change goes through here, so the screen-reader announcement
  // follows what happened. Typing is announced once it pauses.
  function act(action: Action) {
    if (timer.current) clearTimeout(timer.current);
    dispatch(action);
    setAnnouncement("");
    if (action.type === "switch") setAnnouncement(`${BUSINESSES[action.business].label} sample loaded`);
    else if (action.type === "reset") setAnnouncement("Sample restored");
    else timer.current = setTimeout(() => setAnnouncement("Preview updated"), 800);
  }

  function publish() {
    if (timer.current) clearTimeout(timer.current);
    dispatch({ type: "publish" });
    const done = () => {
      dispatch({ type: "published" });
      setAnnouncement("Published in this demo. Nothing was sent.");
    };
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) done();
    else timer.current = setTimeout(done, PUBLISH_MS);
  }

  function onTabKey(event: KeyboardEvent<HTMLButtonElement>) {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const next: Tab = event.key === "Home" ? "web" : event.key === "End" ? "phone" : tab === "web" ? "phone" : "web";
    setTab(next);
    document.getElementById(`${ids}-tab-${next}`)?.focus();
  }

  const status =
    state.status === "published" ? (
      <StatusMark key={state.publishes} status="published" label="Published to website and app" animate={state.publishes > 0} />
    ) : state.status === "publishing" ? (
      <StatusMark status="pending" label="Publishing…" />
    ) : (
      <StatusMark status="changed" />
    );

  return (
    <div className="flex flex-col gap-5">
      <div className="glass flex flex-wrap items-center justify-between gap-3 rounded-xl px-3 py-2 sm:rounded-full">
        <fieldset className="flex flex-wrap items-center gap-1">
          <legend className="sr-only">Sample business</legend>
          {BUSINESS_IDS.map((id) => (
            <label
              key={id}
              className={cx(
                "flex min-h-11 cursor-pointer items-center gap-2 rounded-full px-4 text-body",
                "has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-(--ff-focus-ring)",
                state.business === id ? "bg-surface font-semibold text-fg" : "text-fg-secondary hover:text-fg",
              )}
            >
              <input
                type="radio"
                name={`${ids}-business`}
                checked={state.business === id}
                onChange={() => act({ type: "switch", business: id })}
                className="sr-only"
              />
              <span aria-hidden="true" className={cx("h-2.5 w-2.5 rounded-full ring-1 ring-line-strong", BUSINESSES[id].accent)} />
              {BUSINESSES[id].label}
            </label>
          ))}
        </fieldset>
        <span data-testid="demo-status" className="px-2 text-fg-secondary">
          {status}
        </span>
      </div>

      <div ref={stage} className="relative grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:gap-14">
        {lines && (
          <svg aria-hidden="true" className="pointer-events-none absolute inset-0 hidden h-full w-full overflow-visible lg:block">
            <Connector d={lines.toWeb} drawn />
            <Connector d={lines.toPhone} drawn />
          </svg>
        )}
        {lines && state.status === "publishing" && (
          <div key={state.publishes} aria-hidden="true" className="pointer-events-none absolute inset-0 hidden motion-reduce:hidden lg:block">
            {[lines.toWeb, lines.toPhone].map((d) => (
              <span key={d} data-testid="publish-travel" className="ff-travel" style={{ offsetPath: `path("${d}")` }} />
            ))}
          </div>
        )}

        <div ref={editor} className="relative min-w-0 lg:self-start">
          <EditorPanel state={state} dispatch={act} onPublish={publish} />
        </div>

        <div className="relative flex min-w-0 flex-col gap-3 lg:pt-10">
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
            <p data-testid="preview-label" className="text-label text-fg-secondary lg:absolute lg:top-0 lg:right-0">
              {state.status === "published" ? "Published" : "Unpublished changes"}
            </p>
          </div>

          <div className="grid min-w-0 gap-6 md:grid-cols-[minmax(0,1fr)_auto] md:items-start">
            <div
              ref={web}
              id={`${ids}-panel-web`}
              role="tabpanel"
              aria-labelledby={`${ids}-tab-web`}
              className={cx("min-w-0 transition-opacity duration-200", tab !== "web" && "max-md:hidden")}
            >
              <p className="sr-only">The sample page as a website. It shows the content in the editor.</p>
              <div key={state.business} className="ff-row-in">
                <WebPreview business={state.business} draft={state.draft} />
              </div>
            </div>
            <div
              ref={phone}
              id={`${ids}-panel-phone`}
              role="tabpanel"
              aria-labelledby={`${ids}-tab-phone`}
              className={cx("flex min-w-0 justify-center", tab !== "phone" && "max-md:hidden")}
            >
              <p className="sr-only">The sample page as an app screen. It shows the content in the editor.</p>
              <div key={state.business} className="ff-row-in">
                <PhonePreview business={state.business} draft={state.draft} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <p role="status" className="sr-only">
        {announcement}
      </p>
      <p className="text-label text-fg-secondary">
        This is a demo. What you write stays on this page, and nothing is sent.
      </p>
    </div>
  );
}
