import { Badge, buttonClasses, cx } from "@flowforge/ui";
import type { Metadata } from "next";
import Link from "next/link";
import { COMPARISON, formatPrice, PLANS } from "@/lib/pricing";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Early access plans for Flowforge, from free for one small business to agencies.",
};

const QUESTIONS = [
  {
    q: "Will these prices change?",
    a: "They may, before early access ends. We will tell everyone on a plan well before any change.",
  },
  {
    q: "Do I need a card to start?",
    a: "No. Starter is free, and you can create a workspace without any payment details.",
  },
  {
    q: "Can I move between plans?",
    a: "That is the plan once billing is ready. Your content will stay where it is whichever plan you are on.",
  },
];

function Included({ value }: { value: boolean }) {
  return value ? (
    <>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="text-success">
        <path d="M5 12.5l4.5 4.5L19 7.5" />
      </svg>
      <span className="sr-only">Included</span>
    </>
  ) : (
    <>
      <span aria-hidden="true" className="text-fg-muted">–</span>
      <span className="sr-only">Not included</span>
    </>
  );
}

export default function PricingPage() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-20 px-4 pt-16 sm:px-6 sm:pt-24 lg:px-8">
      <div className="flex max-w-2xl flex-col gap-4">
        <h1 className="text-display text-fg">Pricing</h1>
        <p className="text-section font-normal text-fg-secondary">
          Start free with one site. Pay when your team and your publishing grow.
        </p>
        <Badge className="self-start">Early access pricing</Badge>
      </div>

      <ul aria-label="Plans" className="glass grid rounded-lg md:grid-cols-3">
        {PLANS.map((plan, index) => (
          <li
            key={plan.id}
            className={cx(
              "flex flex-col gap-5 p-6 sm:p-8",
              index > 0 && "border-t border-line md:border-t-0 md:border-l",
            )}
          >
            <div className="flex flex-col gap-1">
              <h2 className="text-section text-fg">{plan.name}</h2>
              <p className="text-body text-fg-muted">{plan.summary}</p>
            </div>
            <p className="flex items-baseline gap-1.5">
              {plan.monthlyPrice === null ? (
                <span className="text-stat text-fg">Custom</span>
              ) : (
                <>
                  <span className="text-stat text-fg tabular-nums">{formatPrice(plan.monthlyPrice)}</span>
                  <span className="text-body text-fg-muted">a month</span>
                </>
              )}
            </p>
            <ul className="flex flex-1 flex-col gap-2 text-body text-fg">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-center gap-2.5">
                  <Included value />
                  {feature}
                </li>
              ))}
            </ul>
            <Link
              href={plan.cta.href}
              className={buttonClasses({ variant: "secondary" })}
            >
              {plan.cta.label}
            </Link>
          </li>
        ))}
      </ul>

      <section aria-labelledby="compare-title" className="flex flex-col gap-6">
        <h2 id="compare-title" className="text-page text-fg">Compare plans</h2>
        <div
          role="region"
          aria-label="Plan comparison, scrolls sideways"
          tabIndex={0}
          className="relative overflow-x-auto rounded-lg border border-line"
        >
          <table className="w-full min-w-xl border-collapse text-left text-body">
            <thead>
              <tr className="border-b border-line-strong">
                <th scope="col" className="px-4 py-3 font-medium text-fg-secondary">Feature</th>
                {PLANS.map((plan) => (
                  <th key={plan.id} scope="col" className="px-4 py-3 font-medium text-fg">{plan.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COMPARISON.map((row) => (
                <tr key={row.feature} className="border-b border-line last:border-b-0">
                  <th scope="row" className="px-4 py-3 font-normal text-fg-secondary">{row.feature}</th>
                  {PLANS.map((plan) => {
                    const value = row.values[plan.id];
                    return (
                      <td key={plan.id} className="px-4 py-3 text-fg">
                        {typeof value === "boolean" ? <Included value={value} /> : value}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section aria-labelledby="pricing-questions-title" className="grid gap-10 lg:grid-cols-[1fr_2fr]">
        <h2 id="pricing-questions-title" className="text-page text-fg">Questions about pricing</h2>
        <div className="flex flex-col">
          {QUESTIONS.map((item) => (
            <details key={item.q} className="group border-t border-line-strong">
              <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-3 text-title text-fg [&::-webkit-details-marker]:hidden">
                {item.q}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true" className="flex-none text-fg-secondary transition-transform duration-[120ms] group-open:rotate-45 motion-reduce:transition-none">
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </summary>
              <p className="max-w-xl pb-5 text-body text-fg-secondary">{item.a}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
