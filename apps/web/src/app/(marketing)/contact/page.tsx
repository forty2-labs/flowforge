import type { Metadata } from "next";
import { CONTACT_EMAIL, SOCIAL_LINKS } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description: "Email the Flowforge team or find us on social media.",
};

export default function ContactPage() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-16 px-4 pt-16 sm:px-6 sm:pt-24 lg:px-8">
      <div className="flex max-w-2xl flex-col gap-4">
        <h1 className="text-display text-fg">Talk to us</h1>
        <p className="text-section font-normal text-fg-secondary">
          Questions about Flowforge, a plan for your agency, or something that
          did not work as it should: write to us and a person will answer.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section aria-labelledby="email-title" className="glass flex flex-col gap-3 rounded-lg p-6 sm:p-8">
          <h2 id="email-title" className="text-section text-fg">Email</h2>
          <a href={`mailto:${CONTACT_EMAIL}`} className="self-start text-section wrap-anywhere sm:text-page">
            {CONTACT_EMAIL}
          </a>
          <p className="text-body text-fg-muted">We reply within two working days.</p>
        </section>

        <section aria-labelledby="social-title" className="glass flex flex-col gap-3 rounded-lg p-6 sm:p-8">
          <h2 id="social-title" className="text-section text-fg">Elsewhere</h2>
          <ul className="flex flex-col">
            {SOCIAL_LINKS.map((social) => (
              <li key={social.name} className="border-t border-line first:border-t-0">
                <a
                  href={social.href}
                  rel="noopener noreferrer"
                  target="_blank"
                  className="flex min-h-12 items-center justify-between gap-4 text-body"
                >
                  <span className="font-medium text-fg">{social.name}</span>
                  <span className="text-fg-muted">
                    {social.handle}
                    <span className="sr-only"> (opens in a new tab)</span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
