// Facts about the public site, kept in one place. The contact email, social
// handles and team are placeholders until the real ones are settled.

export const SITE_URL = process.env.SITE_URL ?? "http://localhost:3000";

// `wide` links show in the desktop bar only from lg up; the phone menu and
// the footer list every link.
export const NAV_LINKS = [
  { href: "/#product", label: "Product" },
  { href: "/#workflow", label: "How it works", wide: true },
  { href: "/#playground", label: "Playground" },
  { href: "/pricing", label: "Pricing" },
  { href: "/about", label: "About", wide: true },
  { href: "/contact", label: "Contact", wide: true },
] as const;

export const CONTACT_EMAIL = "hello@flowforge.example";

export const SOCIAL_LINKS = [
  { name: "X", href: "https://x.com/flowforge", handle: "@flowforge" },
  { name: "LinkedIn", href: "https://www.linkedin.com/company/flowforge", handle: "Flowforge" },
  { name: "Instagram", href: "https://www.instagram.com/flowforge", handle: "@flowforge" },
  { name: "GitHub", href: "https://github.com/flowforge", handle: "flowforge" },
] as const;

export const TEAM = [
  { name: "Amara Okafor", role: "Product and design" },
  { name: "Jonas Lindqvist", role: "Engineering" },
  { name: "Priya Raman", role: "Customer success" },
] as const;
