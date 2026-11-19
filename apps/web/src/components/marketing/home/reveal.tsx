"use client";

import { cx } from "@flowforge/ui";
import { useEffect, useRef, useState, type CSSProperties, type ReactNode, type RefObject } from "react";

// True from the first time the element is on screen. It starts true, so the
// server render and a page without JavaScript show everything; on mount, an
// element that is still below the fold is hidden until it scrolls in, which
// the visitor never sees happen. Reduced motion keeps it true.
export function useSeen<T extends Element>(ref: RefObject<T | null>): boolean {
  const [seen, setSeen] = useState(true);
  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (el.getBoundingClientRect().top < window.innerHeight) return;
    setSeen(false);
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setSeen(true);
        observer.disconnect();
      },
      { rootMargin: "0px 0px -15% 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref]);
  return seen;
}

// Rises into place the first time it is seen (see `.ff-reveal` in
// motion.css). The home page uses it in three places only: the channels,
// the dashboard and the workflow.
export function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  /** Milliseconds to wait after the element is seen, to stagger siblings. */
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const seen = useSeen(ref);
  return (
    <div
      ref={ref}
      data-shown={seen || undefined}
      style={delay ? ({ transitionDelay: `${delay}ms` } as CSSProperties) : undefined}
      className={cx("ff-reveal", className)}
    >
      {children}
    </div>
  );
}
