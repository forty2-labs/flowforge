import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy",
  description: "How Flowforge handles your data.",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="text-page">Privacy</h1>
      <p className="mt-4 text-body text-fg-secondary">
        We are writing our privacy policy. It will be published here before
        Flowforge leaves early access.
      </p>
    </div>
  );
}
