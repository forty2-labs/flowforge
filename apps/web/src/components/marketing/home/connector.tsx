import { cx } from "@flowforge/ui";

// One line in a connector diagram: an SVG path that draws itself in once
// `drawn` turns true, and can then send a published dot along it every few
// seconds. Use it inside an <svg>. Decorative: the diagram around it says in
// words what it connects.
export function Connector({
  d,
  drawn,
  delay = 0,
  travel = false,
  className,
}: {
  d: string;
  drawn: boolean;
  /** Milliseconds before this line starts drawing, to stagger a set. */
  delay?: number;
  /** After drawing, send a dot along the line on a loop. */
  travel?: boolean;
  className?: string;
}) {
  return (
    <g data-testid="connector" data-drawn={drawn}>
      <path
        d={d}
        pathLength={1}
        fill="none"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeDasharray="1"
        style={{ strokeDashoffset: drawn ? 0 : 1, transitionDelay: `${delay}ms` }}
        className={cx("stroke-line-strong transition-[stroke-dashoffset] duration-600 ease-(--ff-ease-out) motion-reduce:transition-none", className)}
      />
      {drawn && travel && (
        <circle r={4} className="fill-success motion-reduce:hidden" opacity={0}>
          <animateMotion dur="3.2s" begin={`${delay + 600}ms`} repeatCount="indefinite" path={d} keyPoints="0;1" keyTimes="0;1" calcMode="linear" />
          <animate attributeName="opacity" dur="3.2s" begin={`${delay + 600}ms`} repeatCount="indefinite" values="0;1;1;0" keyTimes="0;0.1;0.85;1" />
        </circle>
      )}
    </g>
  );
}
