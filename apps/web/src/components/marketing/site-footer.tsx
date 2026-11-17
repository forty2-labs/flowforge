import { Wordmark } from "@flowforge/ui";
import Link from "next/link";
import { CONTACT_EMAIL, NAV_LINKS, SOCIAL_LINKS } from "@/lib/site";

const linkClass =
  "inline-flex min-h-11 items-center text-body text-fg-secondary hover:text-fg sm:min-h-8";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-line">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr_1fr] lg:px-8">
        <div className="flex flex-col gap-3">
          <Wordmark size={24} />
          <p className="max-w-72 text-body text-fg-secondary">
            Write your content once. Publish it to your website and your app.
          </p>
          <a href={`mailto:${CONTACT_EMAIL}`} className="self-start text-body">
            {CONTACT_EMAIL}
          </a>
        </div>
        <FooterGroup title="Product">
          <li><Link href="/" className={linkClass}>Home</Link></li>
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <Link href={link.href} className={linkClass}>{link.label}</Link>
            </li>
          ))}
        </FooterGroup>
        <FooterGroup title="Follow">
          {SOCIAL_LINKS.map((social) => (
            <li key={social.name}>
              <a href={social.href} rel="noopener noreferrer" target="_blank" className={linkClass}>
                {social.name}
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            </li>
          ))}
        </FooterGroup>
        <FooterGroup title="Legal">
          <li><Link href="/privacy" className={linkClass}>Privacy</Link></li>
          <li><Link href="/terms" className={linkClass}>Terms</Link></li>
        </FooterGroup>
      </div>
      <div className="mx-auto max-w-6xl px-4 pb-10 text-helper text-fg-secondary sm:px-6 lg:px-8">
        <Copyright />
      </div>
    </footer>
  );
}

function FooterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-label font-medium text-fg">{title}</h2>
      <ul className="flex flex-col">{children}</ul>
    </div>
  );
}

async function Copyright() {
  "use cache";
  return <p>© {new Date().getFullYear()} Flowforge</p>;
}
