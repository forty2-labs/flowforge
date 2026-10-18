import type { Metadata } from "next";
import { Geist_Mono, Newsreader, Schibsted_Grotesk } from "next/font/google";
import { ToastProvider } from "@flowforge/ui";
import { THEME_SCRIPT } from "@/lib/theme-script";
import "./globals.css";

// Interface chrome. Drawn for a news publisher, which suits a publishing tool.
const schibsted = Schibsted_Grotesk({
  variable: "--font-schibsted",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Anything a business publishes is shown in this face, so content and
// chrome are easy to tell apart.
const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  axes: ["opsz"],
});

export const metadata: Metadata = {
  title: { default: "Flowforge", template: "%s · Flowforge" },
  description:
    "Manage the content and layouts of your website and apps in one place.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${schibsted.variable} ${geistMono.variable} ${newsreader.variable} h-full antialiased`}
      // The theme script sets data-theme before React hydrates.
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body className="ground min-h-full flex flex-col font-sans text-fg">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
