import { defineConfig, devices } from "@playwright/test";

// Walks the real app (web, API and Postgres) to save screenshots and run
// accessibility checks. Start Postgres with `npm run db:up` first.
export default defineConfig({
  testDir: "e2e",
  outputDir: "test-results/artifacts",
  workers: 1,
  fullyParallel: false,
  timeout: 120_000,
  reporter: [["list"]],
  use: {
    baseURL: process.env.WEB_URL ?? "http://localhost:3000",
    trace: "retain-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "npm run dev",
    cwd: "../..",
    url: "http://localhost:3000/signin",
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
