import { expect, test, type Page } from "@playwright/test";

// Behaviour of the public site: routing at /, the shared header and footer,
// the home page, the editor demo, and the other marketing pages. Screenshots
// and the axe sweep for these pages live in screens.spec.ts.

let counter = 0;

// Signs up a fresh account and creates a workspace, ending on /w/<slug>.
async function signUp(page: Page): Promise<void> {
  const stamp = `${Date.now()}-${counter++}`;
  await page.goto("/signup");
  await page.getByLabel("Your name").fill("Maya Ortiz");
  await page.getByLabel("Work email").fill(`public+${stamp}@example.com`);
  await page.getByLabel("Password").fill("northstar2026");
  await page.getByRole("button", { name: "Create account" }).click();
  await page.waitForURL("**/workspaces/new");
  await page.getByLabel("Workspace name").fill("Northstar Studio");
  await page.getByRole("button", { name: "Create workspace" }).click();
  await page.waitForURL(/\/w\/[^/]+$/);
}

// The home page marks its root, so a test can tell it apart from a page a
// streamed redirect lands on later.
async function expectHome(page: Page): Promise<void> {
  await page.waitForLoadState("networkidle");
  expect(new URL(page.url()).pathname).toBe("/");
  await expect(page.locator('[data-page="home"]')).toBeVisible();
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
}

test.describe("routing", () => {
  test("signed-out visitor sees the home page at /", async ({ page }) => {
    await page.goto("/");
    await expectHome(page);
  });

  test("signed-in visitor at / lands in their workspace", async ({ page }) => {
    await signUp(page);
    await page.goto("/");
    await page.waitForURL(/\/w\/[^/]+$/);
  });

  test("signed-in visitor can open /pricing", async ({ page }) => {
    await signUp(page);
    await page.goto("/pricing");
    await page.waitForLoadState("networkidle");
    expect(new URL(page.url()).pathname).toBe("/pricing");
  });

  test("stale session cookie at / shows the home page and is cleared", async ({
    page,
    context,
    baseURL,
  }) => {
    await context.addCookies([{ name: "ff_session", value: "not-a-session", url: baseURL! }]);
    await page.goto("/");
    await expectHome(page);
    const cookies = await context.cookies();
    expect(cookies.find((cookie) => cookie.name === "ff_session")).toBeUndefined();
  });
});
