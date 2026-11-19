import { buttonClasses } from "@flowforge/ui";
import Link from "next/link";
import { HeroShapes } from "../illustrations";

// The page ends the way it opened: the hero's shapes, mirrored, behind one
// glass panel with the call to action.
export function Closing() {
  return (
    <section aria-labelledby="closing-title" className="relative isolate overflow-hidden rounded-xl px-4 py-20 sm:px-10 sm:py-28">
      <HeroShapes className="absolute inset-0 -z-10 h-full w-full -scale-x-100" />
      <div className="glass-strong mx-auto flex max-w-3xl flex-col items-center gap-6 rounded-xl px-6 py-12 text-center shadow-dialog sm:px-12">
        <h2 id="closing-title" className="text-page text-fg sm:text-display">
          Your next digital experience starts here.
        </h2>
        <p className="max-w-xl text-section font-normal text-fg-secondary">
          Build, manage and deliver content without being limited by the platform you started with.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link href="/signup" className={buttonClasses({ size: "lg" })}>
            Get started
          </Link>
          <Link href="#playground" className={buttonClasses({ variant: "ghost", size: "lg" })}>
            Explore the platform
          </Link>
        </div>
      </div>
    </section>
  );
}
