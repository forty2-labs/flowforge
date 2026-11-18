"use client";

import { useEffect, useState } from "react";

// True once the page has scrolled past the sentinel the marketing layout
// puts at the top of the page (`#scroll-sentinel`, a 24 px strip). Watched with
// IntersectionObserver, so nothing runs on every scroll event, and a page
// that loads already scrolled (a reload, an anchor link) starts true.
export function useScrolled(): boolean {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const sentinel = document.getElementById("scroll-sentinel");
    if (!sentinel) return;
    const observer = new IntersectionObserver(([entry]) => setScrolled(!(entry?.isIntersecting ?? true)));
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);
  return scrolled;
}
