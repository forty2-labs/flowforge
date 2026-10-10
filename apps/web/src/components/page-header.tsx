import type { ReactNode } from "react";

export function PageHeader({
  title,
  description,
}: {
  title: string;
  description?: ReactNode;
}) {
  return (
    <header className="flex flex-col gap-1.5">
      <h1 className="text-[28px] leading-9 font-semibold tracking-[-0.015em]">{title}</h1>
      {description && (
        <p className="max-w-[720px] text-sm text-fg-secondary">{description}</p>
      )}
    </header>
  );
}

export function Card({
  title,
  children,
}: {
  title?: string;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-4 rounded-lg border border-line bg-surface p-5">
      {title && <h2 className="text-lg leading-[26px] font-semibold">{title}</h2>}
      {children}
    </section>
  );
}
