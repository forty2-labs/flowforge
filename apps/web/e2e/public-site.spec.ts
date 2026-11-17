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

test.describe("site chrome", () => {
  test("header links reach every page", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    const nav = page.getByRole("navigation", { name: "Main" });
    for (const label of ["Pricing", "About", "Contact"]) {
      await expect(nav.getByRole("link", { name: label })).toBeVisible();
    }
    const banner = page.getByRole("banner");
    await expect(banner.getByRole("link", { name: "Sign in" })).toHaveAttribute("href", "/signin");
    await expect(banner.getByRole("link", { name: "Get started" })).toHaveAttribute("href", "/signup");
  });

  test("theme switch cycles light, dark, system", async ({ page }) => {
    const hydration: string[] = [];
    page.on("console", (message) => {
      if (/hydrat/i.test(message.text())) hydration.push(message.text());
    });
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    const html = page.locator("html");
    const button = page.getByRole("button", { name: /^Theme:/ });
    await expect(button).toHaveAccessibleName("Theme: System");
    await button.click();
    await expect(html).toHaveAttribute("data-theme", "light");
    await expect(button).toHaveAccessibleName("Theme: Light");
    await button.click();
    await expect(html).toHaveAttribute("data-theme", "dark");
    await expect(button).toHaveAccessibleName("Theme: Dark");
    await button.click();
    await expect(html).not.toHaveAttribute("data-theme");
    await expect(button).toHaveAccessibleName("Theme: System");
    expect(hydration).toEqual([]);
  });

  test("mobile menu opens and closes with Escape", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 900 });
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    const banner = page.getByRole("banner");
    await expect(banner.getByRole("link", { name: "Pricing" })).toBeHidden();
    const menu = page.getByRole("button", { name: "Menu" });
    await menu.click();
    const dialog = page.getByRole("dialog", { name: "Menu" });
    await expect(dialog.getByRole("link", { name: "Pricing" })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(menu).toBeFocused();
  });

  test("footer lists contact and social links", async ({ page }) => {
    await page.goto("/");
    const footer = page.getByRole("contentinfo");
    await expect(footer.locator('a[href^="mailto:"]')).toHaveCount(1);
    for (const network of ["X", "LinkedIn", "Instagram", "GitHub"]) {
      await expect(footer.getByRole("link", { name: new RegExp(`^${network}\\b`) })).toBeVisible();
    }
  });

  test("privacy and terms pages exist", async ({ page }) => {
    for (const path of ["/privacy", "/terms"]) {
      const response = await page.goto(path);
      expect(response?.status(), path).toBe(200);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    }
  });
});

test.describe("home", () => {
  test("home explains the product and links to the demo", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    await expect(page.getByRole("link", { name: "See it work" })).toHaveAttribute("href", "#demo");
    await expect(page.locator("#demo")).toHaveCount(1);
  });

  test("how it works has three steps in order", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("list", { name: "How it works" }).getByRole("listitem")).toHaveCount(3);
  });

  test("FAQ answers expand", async ({ page }) => {
    await page.goto("/");
    const section = page.getByRole("region", { name: "Questions" });
    const first = section.locator("details").first();
    await first.locator("summary").click();
    await expect(first).toHaveAttribute("open", "");
  });

  test("home sets page metadata", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Flowforge/);
    await expect(page.locator('meta[property="og:title"]')).toHaveCount(1);
  });
});

test.describe("demo", () => {
  const CAFE_TITLE = "Spring menu, now serving";

  async function openDemo(page: Page, width = 1440) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/#demo");
    await page.waitForLoadState("networkidle");
    const demo = page.locator("#demo");
    return {
      demo,
      title: demo.getByLabel("Title"),
      web: demo.getByTestId("preview-web"),
      phone: demo.getByTestId("preview-phone"),
      status: demo.getByTestId("demo-status"),
      previewLabel: demo.getByTestId("preview-label"),
      live: demo.getByRole("status"),
    };
  }

  test("typing updates both previews", async ({ page }) => {
    const d = await openDemo(page);
    await d.title.fill("Autumn menu");
    await expect(d.web).toContainText("Autumn menu");
    await expect(d.phone).toContainText("Autumn menu");
    await expect(d.status).toHaveText("Unpublished changes");
    await expect(d.previewLabel).toHaveText("Preview of unpublished changes");
  });

  test("publish marks the page published", async ({ page }) => {
    const d = await openDemo(page);
    await d.title.fill("Autumn menu");
    await d.demo.getByRole("button", { name: "Publish" }).click();
    await expect(d.status).toHaveText("Published");
    await expect(d.previewLabel).toHaveText("Published");
    await expect(d.live).toContainText("Published");
  });

  test("switching preset resets content and status", async ({ page }) => {
    const d = await openDemo(page);
    await d.title.fill("Autumn menu");
    // People click the visible label; the radio itself is visually hidden.
    await d.demo.locator("label", { hasText: "Shop" }).click();
    await expect(d.demo.getByRole("radio", { name: "Shop" })).toBeChecked();
    await expect(d.status).toHaveText("Published");
    await expect(d.title).not.toHaveValue("Autumn menu");
    const shopTitle = await d.title.inputValue();
    await expect(d.web).toContainText(shopTitle);
    await expect(d.phone).toContainText(shopTitle);
  });

  test("reset restores the preset", async ({ page }) => {
    const d = await openDemo(page);
    await d.title.fill("Autumn menu");
    await d.demo.getByRole("button", { name: "Reset" }).click();
    await expect(d.title).toHaveValue(CAFE_TITLE);
    await expect(d.status).toHaveText("Published");
  });

  test("empty title shows Untitled", async ({ page }) => {
    const d = await openDemo(page);
    await d.title.fill("");
    await expect(d.web).toContainText("Untitled");
    await expect(d.phone).toContainText("Untitled");
  });

  test("long words wrap at 360 px", async ({ page }) => {
    const d = await openDemo(page, 360);
    await d.title.fill("a".repeat(200));
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });

  test("phone width switches previews with tabs", async ({ page }) => {
    const d = await openDemo(page, 390);
    const website = d.demo.getByRole("tab", { name: "Website" });
    await expect(website).toHaveAttribute("aria-selected", "true");
    await website.focus();
    await page.keyboard.press("ArrowRight");
    const phoneTab = d.demo.getByRole("tab", { name: "Phone" });
    await expect(phoneTab).toHaveAttribute("aria-selected", "true");
    await expect(phoneTab).toBeFocused();
    await expect(d.phone).toBeVisible();
    await expect(d.web).toBeHidden();
  });

  test("demo works from the keyboard", async ({ page }) => {
    const d = await openDemo(page);
    await d.demo.getByRole("radio", { name: "Café" }).focus();
    for (let i = 0; i < 5 && !(await d.title.evaluate((el) => el === document.activeElement)); i++) {
      await page.keyboard.press("Tab");
    }
    await expect(d.title).toBeFocused();
    await page.keyboard.press("End");
    await page.keyboard.type(" today");
    await expect(d.status).toHaveText("Unpublished changes");
    const publish = d.demo.getByRole("button", { name: "Publish" });
    for (let i = 0; i < 10 && !(await publish.evaluate((el) => el === document.activeElement)); i++) {
      await page.keyboard.press("Tab");
    }
    await expect(publish).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(d.status).toHaveText("Published");
  });
});
