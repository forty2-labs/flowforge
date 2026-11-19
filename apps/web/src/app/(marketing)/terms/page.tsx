import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms",
  description: "The terms for using Flowforge.",
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="text-page">Terms</h1>
      <p className="mt-4 text-body text-fg-secondary">
        We are writing our terms of service. They will be published here
        before Flowforge leaves early access.
      </p>
    </div>
  );
}
