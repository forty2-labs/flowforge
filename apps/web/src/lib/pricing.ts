// Early access plans for the public pricing page. Names, prices and limits
// are placeholders until billing is built; nothing enforces them yet.

export type PlanId = "starter" | "growth" | "agency";

export type Plan = {
  id: PlanId;
  name: string;
  /** Per month, in US dollars. `null` means priced per agency. */
  monthlyPrice: number | null;
  summary: string;
  features: string[];
  cta: { label: string; href: "/signup" | "/contact" };
};

export const PLANS: Plan[] = [
  {
    id: "starter",
    name: "Starter",
    monthlyPrice: 0,
    summary: "For one small business finding its feet.",
    features: ["One website", "Up to 3 people", "500 entries", "Drafts and publishing"],
    cta: { label: "Start for free", href: "/signup" },
  },
  {
    id: "growth",
    name: "Growth",
    monthlyPrice: 24,
    summary: "For a business that publishes every week.",
    features: ["A website and an app", "Up to 15 people", "Unlimited entries", "All five roles"],
    cta: { label: "Choose Growth", href: "/signup" },
  },
  {
    id: "agency",
    name: "Agency",
    monthlyPrice: null,
    summary: "For studios running sites for several clients.",
    features: ["A workspace per client", "Unlimited people", "Priority help", "Custom domains"],
    cta: { label: "Talk to us", href: "/contact" },
  },
];

export const COMPARISON: { feature: string; values: Record<PlanId, string | boolean> }[] = [
  { feature: "Websites", values: { starter: "1", growth: "1", agency: "Per client" } },
  { feature: "App", values: { starter: false, growth: true, agency: true } },
  { feature: "People", values: { starter: "3", growth: "15", agency: "Unlimited" } },
  { feature: "Entries", values: { starter: "500", growth: "Unlimited", agency: "Unlimited" } },
  { feature: "Roles", values: { starter: "Owner, Editor", growth: "All five", agency: "All five" } },
  { feature: "Custom domain", values: { starter: false, growth: true, agency: true } },
  { feature: "Priority help", values: { starter: false, growth: false, agency: true } },
];

const usd = new Intl.NumberFormat("en", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export function formatPrice(amount: number): string {
  return usd.format(amount);
}
