'use client';

import { useEffect, useRef, useState, type HTMLAttributes, type PointerEvent } from 'react';
import { cx } from './cx';

const REST = 'perspective(900px) rotateX(0deg) rotateY(0deg)';

// Tilts its content in 3D as a mouse or pen moves over it, and settles when
// the pointer leaves. Children placed at different depths (translateZ) lift
// off the surface. Touch and reduced motion get a flat, still element.
export function Tilt({
  max = 8,
  className,
  children,
  ...rest
}: HTMLAttributes<HTMLDivElement> & { /** Largest rotation, in degrees. */ max?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setEnabled(!reduce.matches);
    update();
    reduce.addEventListener('change', update);
    return () => reduce.removeEventListener('change', update);
  }, []);

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!enabled || !el || event.pointerType === 'touch') return;
    const rect = el.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    const rotateX = (-y * 2 * max).toFixed(2);
    const rotateY = (x * 2 * max).toFixed(2);
    el.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  }

  function onPointerLeave() {
    if (enabled && ref.current) ref.current.style.transform = REST;
  }

  return (
    <div
      ref={ref}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      className={cx(
        'transform-3d transition-transform duration-200 ease-out motion-reduce:transition-none',
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
