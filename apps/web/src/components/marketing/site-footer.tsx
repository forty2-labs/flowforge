import { Wordmark } from "@flowforge/ui";
import Link from "next/link";
import { CONTACT_EMAIL, SOCIAL_LINKS } from "@/lib/site";

const linkClass =
  "inline-flex min-h-11 items-center text-body text-fg-secondary hover:text-fg sm:min-h-8";

// Pages that do not exist yet are named in the footer but not linked, so
// nobody follows a link to nothing.
const GROUPS: { title: string; links: { label: string; href?: string }[] }[] = [
  {
    title: "Product",
    links: [
      { label: "Overview", href: "/" },
      { label: "Features", href: "/#product" },
      { label: "How it works", href: "/#workflow" },
      { label: "Pricing", href: "/pricing" },
    ],
  },
  {
    title: "Solutions",
    links: [
      { label: "Cafés", href: "/#product" },
      { label: "Restaurants", href: "/#product" },
      { label: "Retail", href: "/#product" },
      { label: "Small businesses", href: "/#product" },
    ],
  },
  {
    title: "Resources",
    links: [{ label: "Documentation" }, { label: "Guides" }, { label: "API reference" }, { label: "Blog" }],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Contact", href: "/contact" },
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="mt-32 border-t border-line">
      <div className="mx-auto grid max-w-6xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.3fr_2fr] lg:px-8">
        <div className="flex flex-col gap-4">
          <Wordmark size={24} />
          <p className="max-w-72 text-body text-fg-secondary">Flexible content infrastructure for every digital experience.</p>
          <a href={`mailto:${CONTACT_EMAIL}`} className="self-start text-body">
            {CONTACT_EMAIL}
          </a>
          <ul aria-label="Follow Flowforge" className="flex flex-wrap gap-x-4">
            {SOCIAL_LINKS.map((social) => (
              <li key={social.name}>
                <a href={social.href} rel="noopener noreferrer" target="_blank" className={linkClass}>
                  {social.name}
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div className="grid grid-cols-2 gap-10 sm:grid-cols-4">
          {GROUPS.map((group) => (
            <div key={group.title} className="flex flex-col gap-2">
              <h2 className="text-label font-medium text-fg">{group.title}</h2>
              <ul className="flex flex-col">
                {group.links.map((link) => (
                  <li key={link.label}>
                    {link.href ? (
                      <Link href={link.href} className={linkClass}>
                        {link.label}
                      </Link>
                    ) : (
                      <span className="inline-flex min-h-11 flex-col justify-center text-body text-fg-secondary sm:min-h-8">
                        {link.label}
                        <span className="text-helper text-fg-secondary">Coming soon</span>
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <div className="mx-auto max-w-6xl px-4 pb-10 text-helper text-fg-secondary sm:px-6 lg:px-8">
        <Copyright />
      </div>
    </footer>
  );
}

async function Copyright() {
  "use cache";
  return <p>© {new Date().getFullYear()} Flowforge</p>;
}
