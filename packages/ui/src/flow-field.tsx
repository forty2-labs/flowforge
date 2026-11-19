'use client';

import { useEffect, useRef } from 'react';
import { cx } from './cx';

// Content flowing out of Flowforge, drawn behind a hero. Draft rings leave a
// hub along soft lanes to each target (a website, a phone) and fill into
// published dots part-way, at `publishAt`. A ring the pointer passes
// publishes early, and marks near the pointer bend off their lane for a
// moment.
//
// Place the canvas inside a positioned container whose children mark the
// anchors: one `data-flow="source"` (the hub) and any number of
// `data-flow="target"`, on either side of it. Positions are read from layout
// (offsets), so a 3D tilt on the container does not throw the lanes out of
// line with the frames.
//
// data-state is "running", "paused" (off screen or hidden tab) or "static"
// (reduced motion). data-flowed counts rings that filled on their way;
// data-published counts rings the pointer published.

type Point = { x: number; y: number };
type Lane = { from: Point; c1: Point; c2: Point; to: Point };

type Mark = {
  lane: number;
  t: number;
  speed: number;
  r: number;
  published: boolean;
  fill: number;
  /** Displacement from the lane, pushed by the pointer and easing back. */
  ox: number;
  oy: number;
};

type Palette = { line: string; ring: string; dot: string };

const LANE_ALPHA = 0.55;
const MARK_ALPHA = 0.85;
const PUBLISH_DISTANCE = 48;
const REPEL_DISTANCE = 90;
const SPAWN_EVERY = 28;

function readPalette(): Palette {
  const styles = getComputedStyle(document.documentElement);
  const value = (name: string) => styles.getPropertyValue(name).trim();
  return {
    line: value('--ff-border-strong'),
    ring: value('--ff-text-muted'),
    dot: value('--ff-success'),
  };
}

// Position of an element relative to `container`, from layout offsets so
// CSS transforms on the way up are ignored.
function offsetWithin(el: HTMLElement, container: HTMLElement) {
  let x = 0;
  let y = 0;
  let node: HTMLElement | null = el;
  while (node && node !== container) {
    x += node.offsetLeft;
    y += node.offsetTop;
    node = node.offsetParent as HTMLElement | null;
  }
  return { x, y, width: el.offsetWidth, height: el.offsetHeight };
}

function cubic(lane: Lane, t: number): Point {
  const u = 1 - t;
  const a = u * u * u;
  const b = 3 * u * u * t;
  const c = 3 * u * t * t;
  const d = t * t * t;
  return {
    x: a * lane.from.x + b * lane.c1.x + c * lane.c2.x + d * lane.to.x,
    y: a * lane.from.y + b * lane.c1.y + c * lane.c2.y + d * lane.to.y,
  };
}

function curve(from: Point, to: Point): Lane {
  const bend = (to.x - from.x) * 0.5;
  return { from, c1: { x: from.x + bend, y: from.y }, c2: { x: to.x - bend, y: to.y }, to };
}

export function FlowField({
  className,
  lanesPerTarget = 3,
  publishAt = 0.55,
}: {
  className?: string;
  /** How many lanes fan out to each target. */
  lanesPerTarget?: number;
  /** Where along a lane (0 to 1) a draft ring fills into a published dot. */
  publishAt?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = canvas?.parentElement;
    const context = canvas?.getContext('2d');
    if (!canvas || !container || !context) return;

    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const dark = window.matchMedia('(prefers-color-scheme: dark)');
    let palette = readPalette();
    let width = 0;
    let height = 0;
    let lanes: Lane[] = [];
    let marks: Mark[] = [];
    let pointer: Point | null = null;
    let flowed = 0;
    let publishedByPointer = 0;
    let visible = true;
    let frame = 0;
    let tick = 0;

    const setState = (state: 'running' | 'paused' | 'static') => {
      canvas.dataset.state = state;
    };

    function layout() {
      width = container!.clientWidth;
      height = container!.clientHeight;
      const ratio = window.devicePixelRatio || 1;
      canvas!.width = Math.round(width * ratio);
      canvas!.height = Math.round(height * ratio);
      context!.setTransform(ratio, 0, 0, ratio, 0, 0);

      const source = container!.querySelector<HTMLElement>('[data-flow="source"]');
      const targets = [...container!.querySelectorAll<HTMLElement>('[data-flow="target"]')];
      lanes = [];
      if (!source) return;
      const s = offsetWithin(source, container!);
      const centre = s.x + s.width / 2;
      for (const target of targets) {
        const tg = offsetWithin(target, container!);
        // Leave the hub on the side facing the target, arrive on its near edge.
        const toRight = tg.x + tg.width / 2 > centre;
        const fromX = toRight ? s.x + s.width : s.x;
        const toX = toRight ? tg.x : tg.x + tg.width;
        const focus = Number(target.dataset.flowY ?? 0.5);
        for (let i = 0; i < lanesPerTarget; i++) {
          const share = lanesPerTarget === 1 ? 0.5 : i / (lanesPerTarget - 1);
          lanes.push(
            curve(
              { x: fromX, y: s.y + s.height * (0.3 + share * 0.4) },
              { x: toX, y: tg.y + tg.height * (focus - 0.25 + share * 0.5) },
            ),
          );
        }
      }
      if (marks.length === 0) seed();
    }

    function launch(t = 0): Mark {
      return {
        lane: Math.floor(Math.random() * Math.max(1, lanes.length)),
        t,
        speed: 0.0035 + Math.random() * 0.002,
        r: 3 + Math.random() * 1.2,
        published: t >= publishAt,
        fill: t >= publishAt ? 1 : 0,
        ox: 0,
        oy: 0,
      };
    }

    function seed() {
      const count = width < 480 ? 8 : 14;
      marks = Array.from({ length: count }, () => launch(Math.random()));
    }

    function position(mark: Mark): Point {
      const lane = lanes[mark.lane % Math.max(1, lanes.length)];
      if (!lane) return { x: -100, y: -100 };
      const point = cubic(lane, mark.t);
      return { x: point.x + mark.ox, y: point.y + mark.oy };
    }

    function draw() {
      context!.clearRect(0, 0, width, height);
      context!.lineWidth = 1;
      context!.setLineDash([3, 5]);
      context!.strokeStyle = palette.line;
      context!.globalAlpha = LANE_ALPHA;
      for (const lane of lanes) {
        context!.beginPath();
        context!.moveTo(lane.from.x, lane.from.y);
        context!.bezierCurveTo(lane.c1.x, lane.c1.y, lane.c2.x, lane.c2.y, lane.to.x, lane.to.y);
        context!.stroke();
      }
      context!.setLineDash([]);

      for (const mark of marks) {
        const { x, y } = position(mark);
        // Marks fade in as they leave the hub and out as they arrive.
        const edge = Math.max(0, Math.min(1, mark.t * 8, (1 - mark.t) * 6));
        context!.globalAlpha = MARK_ALPHA * edge;
        context!.lineWidth = 1.25;
        context!.strokeStyle = mark.published ? palette.dot : palette.ring;
        context!.beginPath();
        context!.arc(x, y, mark.r, 0, Math.PI * 2);
        context!.stroke();
        if (mark.fill > 0) {
          const eased = 1 - (1 - mark.fill) ** 3;
          context!.fillStyle = palette.dot;
          context!.beginPath();
          context!.arc(x, y, mark.r * eased, 0, Math.PI * 2);
          context!.fill();
        }
      }
      context!.globalAlpha = 1;
    }

    function step() {
      // Delivered marks leave; new drafts leave the hub at a steady pace.
      marks = marks.filter((mark) => mark.t < 1);
      tick += 1;
      if (tick % SPAWN_EVERY === 0 && marks.length < 24) marks.push(launch());

      for (const mark of marks) {
        mark.t += mark.speed;
        if (!mark.published && mark.t >= publishAt) {
          mark.published = true;
          flowed += 1;
          canvas!.dataset.flowed = String(flowed);
        }
        if (pointer) {
          const { x, y } = position(mark);
          const dx = x - pointer.x;
          const dy = y - pointer.y;
          const distance = Math.hypot(dx, dy) || 1;
          if (distance < REPEL_DISTANCE) {
            const push = (1 - distance / REPEL_DISTANCE) * 2.4;
            mark.ox += (dx / distance) * push;
            mark.oy += (dy / distance) * push;
          }
          if (!mark.published && distance < PUBLISH_DISTANCE) {
            mark.published = true;
            publishedByPointer += 1;
            canvas!.dataset.published = String(publishedByPointer);
          }
        }
        mark.ox *= 0.92;
        mark.oy *= 0.92;
        if (mark.published && mark.fill < 1) mark.fill = Math.min(1, mark.fill + 0.06);
      }
      draw();
    }

    function loop() {
      step();
      frame = requestAnimationFrame(loop);
    }

    function start() {
      if (still || frame || !visible || document.hidden) return;
      setState('running');
      frame = requestAnimationFrame(loop);
    }

    function stop() {
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      if (!still) setState('paused');
    }

    function onPointerMove(event: PointerEvent) {
      const rect = canvas!.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * width;
      const y = ((event.clientY - rect.top) / rect.height) * height;
      pointer = x >= 0 && y >= 0 && x <= width && y <= height ? { x, y } : null;
    }

    function onThemeChange() {
      palette = readPalette();
      draw();
    }

    function onResize() {
      layout();
      draw();
    }

    const resizeObserver = new ResizeObserver(onResize);
    resizeObserver.observe(container);
    const themeObserver = new MutationObserver(onThemeChange);
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    dark.addEventListener('change', onThemeChange);

    canvas.dataset.flowed = '0';
    canvas.dataset.published = '0';
    onResize();

    if (still) {
      setState('static');
      return () => {
        resizeObserver.disconnect();
        themeObserver.disconnect();
        dark.removeEventListener('change', onThemeChange);
      };
    }

    const visibility = new IntersectionObserver(([entry]) => {
      visible = entry?.isIntersecting ?? true;
      if (visible) start();
      else stop();
    });
    visibility.observe(canvas);
    const onVisibility = () => (document.hidden ? stop() : start());
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    start();

    return () => {
      stop();
      resizeObserver.disconnect();
      themeObserver.disconnect();
      visibility.disconnect();
      dark.removeEventListener('change', onThemeChange);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('pointermove', onPointerMove);
    };
  }, [lanesPerTarget, publishAt]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      data-testid="flow-field"
      className={cx('pointer-events-none absolute inset-0 block h-full w-full', className)}
    />
  );
}
