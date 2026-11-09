import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  experimental: {
    // Policy for `next upgrade --agent` and the upgrade reminders in dev and build.
    agentUpgrade: "security",
  },
  // @flowforge/ui ships TypeScript source.
  transpilePackages: ["@flowforge/ui"],
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
