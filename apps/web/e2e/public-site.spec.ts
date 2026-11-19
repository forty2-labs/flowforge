import { expect, test, type Page } from "@playwright/test";
import { CONTACT_EMAIL, SOCIAL_LINKS, TEAM } from "../src/lib/site";

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
    const menu = page.getByRole("button", { name: "Menu", exact: true });
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

  test("footer groups links by product, solutions, resources and company", async ({ page }) => {
    await page.goto("/");
    const footer = page.getByRole("contentinfo");
    for (const group of ["Product", "Solutions", "Resources", "Company"]) {
      await expect(footer.getByRole("heading", { name: group, exact: true })).toBeVisible();
    }
    await expect(footer.getByText("Flexible content infrastructure for every digital experience.")).toBeVisible();
    // Resources have no pages yet, so they are named but not linked.
    await expect(footer.getByRole("link", { name: /Documentation/ })).toHaveCount(0);
    await expect(footer.getByText("Documentation")).toBeVisible();
    await expect(footer.getByText("Coming soon").first()).toBeVisible();
    await expect(footer.getByRole("link", { name: "Restaurants" })).toHaveAttribute("href", "/#product");
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
  test("the hero shows a website and a phone joined by the flow", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Your business. Your content. Everywhere.");
    const hero = page.locator("section").filter({ has: page.getByRole("heading", { level: 1 }) });
    await expect(hero.getByTestId("flow-field")).toHaveCount(1);
    await expect(hero.locator('[data-flow="source"]')).toHaveCount(1);
    await expect(hero.locator('[data-flow="target"]')).toHaveCount(2);
    await expect(hero.getByRole("textbox")).toHaveCount(0);
    await expect(hero.getByRole("link", { name: "Explore Flowforge" })).toHaveAttribute("href", "#playground");
    await expect(hero.getByRole("link", { name: "See how it works" })).toHaveAttribute("href", "#workflow");
    await expect(page.getByTestId("sub-banner")).toContainText("From your first location to your next hundred");
  });

  test("header starts compact and floats after scrolling", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    const bar = page.getByTestId("site-bar");
    await expect(bar).toHaveAttribute("data-scrolled", "false");
    const compact = (await bar.boundingBox())!.width;
    await page.mouse.wheel(0, 600);
    await expect(bar).toHaveAttribute("data-scrolled", "true");
    await expect.poll(async () => (await bar.boundingBox())!.width).toBeGreaterThan(compact + 100);
  });

  test("header starts floating when the page loads scrolled", async ({ page }) => {
    await page.goto("/#workflow");
    await expect(page.getByTestId("site-bar")).toHaveAttribute("data-scrolled", "true");
  });

  test("header is floating on pages without a hero", async ({ page }) => {
    await page.goto("/pricing");
    await expect(page.getByTestId("site-bar")).toHaveAttribute("data-scrolled", "true");
  });

  test("business cards show four kinds of business", async ({ page }) => {
    await page.goto("/");
    const section = page.locator("#product");
    for (const name of ["Café", "Restaurant", "Retail", "Small business"]) {
      await expect(section.getByRole("heading", { level: 3, name, exact: true })).toBeVisible();
    }
  });

  test("channels show four endpoints and an API node", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    const section = page.locator("#channels");
    for (const name of ["Desktop website", "Mobile website", "iOS app", "Android app"]) {
      await expect(section.getByText(name, { exact: true }).filter({ visible: true })).toBeVisible();
    }
    await expect(section.getByText("API", { exact: true }).first()).toBeVisible();
    await section.scrollIntoViewIfNeeded();
    await expect(section.getByTestId("connector").first()).toHaveAttribute("data-drawn", "true");
  });

  test("content structure switches between café and retail", async ({ page }) => {
    await page.goto("/");
    const section = page.locator("#structure");
    await expect(section.getByText("Menu item", { exact: true })).toBeVisible();
    await expect(section.getByText("Dietary information")).toBeVisible();
    await section.getByRole("radio", { name: "Retail" }).check({ force: true });
    await expect(section.getByText("Product", { exact: true })).toBeVisible();
    await expect(section.getByText("Stock status")).toBeVisible();
    await expect(section.getByText("Dietary information")).toHaveCount(0);
  });

  test("dashboard section is dark in both page themes", async ({ page }) => {
    for (const scheme of ["light", "dark"] as const) {
      await page.emulateMedia({ colorScheme: scheme });
      await page.goto("/");
      const background = await page.locator("#dashboard").evaluate((el) => getComputedStyle(el).backgroundColor);
      expect(background, scheme).toBe("rgb(10, 15, 24)");
    }
  });

  test("scale stepper moves through five stages with the keyboard", async ({ page }) => {
    await page.goto("/");
    const section = page.locator("#scale");
    const first = section.getByRole("radio").first();
    await first.focus();
    for (let i = 0; i < 4; i++) await page.keyboard.press("ArrowRight");
    await expect(section.getByRole("radio").nth(4)).toBeChecked();
    await expect(section.getByTestId("scale-stage")).toHaveAttribute("data-stage", "5");
  });

  test("channels and workflow do not describe the API or apps as available", async ({ page }) => {
    await page.goto("/");
    const main = page.getByRole("main");
    for (const claim of ["Native apps read the same content", "Upload images, update information"]) {
      await expect(main.getByText(claim)).toHaveCount(0);
    }
    for (const id of ["channels", "workflow"]) {
      await expect(page.locator(`#${id}`).getByText(/Coming in the next release|on the roadmap/).first()).toBeVisible();
    }
  });

  test("the dashboard band stands apart from the page in both themes", async ({ page }) => {
    for (const scheme of ["light", "dark"] as const) {
      await page.emulateMedia({ colorScheme: scheme });
      await page.goto("/");
      const edge = await page.locator("#dashboard").evaluate((el) => getComputedStyle(el).borderTopWidth);
      expect(edge, scheme).toBe("1px");
    }
  });

  test("planned features are labelled coming", async ({ page }) => {
    await page.goto("/");
    expect(await page.getByText("Coming in the next release").count()).toBeGreaterThanOrEqual(2);
  });

  test("the workflow joins three steps with a path that draws in", async ({ page }) => {
    await page.goto("/");
    const section = page.locator("#workflow");
    await expect(section.getByRole("list", { name: "From idea to published" }).getByRole("listitem")).toHaveCount(3);
    await section.scrollIntoViewIfNeeded();
    await expect(section.getByTestId("connector").first()).toHaveAttribute("data-drawn", "true");
  });

  test("every home section fits at 360 px", async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 800 });
    await page.goto("/");
    for (const id of ["product", "channels", "playground", "structure", "dashboard", "workflow", "scale"]) {
      const fits = await page.locator(`#${id}`).evaluate((el) => el.scrollWidth <= el.clientWidth + 1);
      expect(fits, id).toBe(true);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(0);
  });

  test("FAQ answers expand", async ({ page }) => {
    await page.goto("/");
    const section = page.getByRole("region", { name: "Questions" });
    const first = section.locator("details").first();
    await first.locator("summary").click();
    await expect(first).toHaveAttribute("open", "");
  });

  test("illustrations keep cobalt for actions only", async ({ page }) => {
    await page.goto("/");
    const cobalt = page.locator('[aria-hidden="true"] :is(.fill-primary, .fill-primary-soft, .stroke-primary)');
    await expect(cobalt).toHaveCount(0);
  });

  test("home copy does not describe unbuilt features as available", async ({ page }) => {
    await page.goto("/");
    const main = page.getByRole("main");
    for (const claim of ["You choose a starting layout", "Both read the same published entries", "see exactly what will change"]) {
      await expect(main.getByText(claim)).toHaveCount(0);
    }
  });

  test("home sets page metadata", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Flowforge/);
    await expect(page.locator('meta[property="og:title"]')).toHaveCount(1);
  });
});

test.describe("playground", () => {
  async function openPlayground(page: Page, width = 1440) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    const demo = page.locator("#playground");
    await demo.scrollIntoViewIfNeeded();
    return {
      demo,
      field: (name: string) => demo.getByRole("textbox", { name, exact: true }),
      web: demo.getByTestId("preview-web"),
      phone: demo.getByTestId("preview-phone"),
      status: demo.getByTestId("demo-status"),
      previewLabel: demo.getByTestId("preview-label"),
      live: demo.getByRole("status"),
      publish: demo.getByRole("button", { name: "Publish" }),
    };
  }

  async function openPageText(page: Page, demo: import("@playwright/test").Locator) {
    await demo.getByRole("tab", { name: "Page text" }).click();
    const editor = demo.getByRole("textbox", { name: "Page text" });
    await expect(editor).toHaveAttribute("contenteditable", "true");
    return editor;
  }

  async function replaceAll(page: Page, editor: import("@playwright/test").Locator, text: string) {
    await editor.click();
    await page.keyboard.press("ControlOrMeta+A");
    if (text) await page.keyboard.type(text);
    else await page.keyboard.press("Backspace");
  }

  test("on desktop the editor sits beside the previews and is narrower", async ({ page }) => {
    const d = await openPlayground(page);
    const editor = (await d.demo.getByTestId("editor-panel").boundingBox())!;
    const web = (await d.web.boundingBox())!;
    const phone = (await d.phone.boundingBox())!;
    expect(web.x).toBeGreaterThan(editor.x + editor.width);
    expect(phone.x).toBeGreaterThan(web.x + web.width - 1);
    expect(editor.width).toBeLessThan(phone.x + phone.width - web.x);
  });

  test("each field updates both previews", async ({ page }) => {
    const d = await openPlayground(page);
    for (const [name, value] of [
      ["Business name", "Driftwood"],
      ["Announcement", "Closed on Monday"],
      ["Headline", "Late breakfast"],
      ["Description", "Eggs until two"],
    ] as const) {
      await d.field(name).fill(value);
      await expect(d.web).toContainText(value);
      await expect(d.phone).toContainText(value);
    }
    await expect(d.status).toHaveText("Unpublished changes");
    await expect(d.previewLabel).toHaveText("Unpublished changes");
  });

  test("switching business loads its sample", async ({ page }) => {
    const d = await openPlayground(page);
    await d.field("Headline").fill("Something else");
    // People click the visible label; the radio itself is visually hidden.
    await d.demo.locator("label", { hasText: "Restaurant" }).click();
    await expect(d.demo.getByRole("radio", { name: "Restaurant" })).toBeChecked();
    await expect(d.web).toContainText("Olive & Ember");
    await expect(d.phone).toContainText("Olive & Ember");
    await expect(d.field("Business name")).toHaveValue("Olive & Ember");
    await expect(d.status).toHaveText("Published to website and app");
    await d.demo.locator("label", { hasText: "Retail" }).click();
    await expect(d.demo.getByRole("list", { name: "Products" })).toBeVisible();
  });

  test("menu rows can be added and removed", async ({ page }) => {
    const d = await openPlayground(page);
    const rows = d.demo.getByRole("list", { name: "Menu items" }).getByRole("listitem");
    const start = await rows.count();
    await d.demo.getByRole("button", { name: "Add menu item" }).click();
    await expect(rows).toHaveCount(start + 1);
    await rows.last().getByRole("textbox", { name: /Name/ }).fill("Cheese scone");
    await rows.last().getByRole("textbox", { name: /Price/ }).fill("2.80");
    await expect(d.web).toContainText("Cheese scone");
    await expect(d.phone).toContainText("2.80");
    const add = d.demo.getByRole("button", { name: "Add menu item" });
    while ((await rows.count()) < 5) await add.click();
    await expect(add).toHaveAttribute("aria-disabled", "true");
    // Pressing it at the limit does nothing. (Playwright waits on
    // aria-disabled controls, so the click is forced.)
    await add.click({ force: true });
    await expect(rows).toHaveCount(5);
    while ((await rows.count()) > 0) await rows.first().getByRole("button", { name: /Remove/ }).click();
    await expect(d.web.getByTestId("preview-items")).toHaveCount(0);
    await expect(d.phone.getByTestId("preview-items")).toHaveCount(0);
    await expect(add).not.toHaveAttribute("aria-disabled", "true");
  });

  test("removing a row keeps keyboard focus in the list", async ({ page }) => {
    const d = await openPlayground(page);
    const rows = d.demo.getByRole("list", { name: "Menu items" }).getByRole("listitem");
    await rows.first().getByRole("button", { name: /Remove/ }).focus();
    await page.keyboard.press("Enter");
    await expect(rows.first().getByRole("textbox", { name: /Name/ })).toBeFocused();
    while ((await rows.count()) > 1) await rows.first().getByRole("button", { name: /Remove/ }).click();
    await rows.first().getByRole("button", { name: /Remove/ }).focus();
    await page.keyboard.press("Enter");
    await expect(d.demo.getByRole("button", { name: "Add menu item" })).toBeFocused();
  });

  test("the image choice changes both previews", async ({ page }) => {
    const d = await openPlayground(page);
    await expect(d.web).toHaveAttribute("data-image", "0");
    const second = d.demo.getByRole("radiogroup", { name: "Featured image" }).getByRole("radio").nth(1);
    await second.check({ force: true });
    await expect(d.web).toHaveAttribute("data-image", "1");
    await expect(d.phone).toHaveAttribute("data-image", "1");
  });

  test("publish sends the change to both previews", async ({ page }) => {
    const d = await openPlayground(page);
    await d.field("Headline").fill("Autumn menu");
    await d.publish.click();
    await expect(d.status).toHaveText("Publishing…");
    await expect(d.status).toHaveText("Published to website and app");
    await expect(d.previewLabel).toHaveText("Published");
    await expect(d.live).toHaveText("Published in this demo. Nothing was sent.");
    await expect(d.publish).toHaveAttribute("aria-disabled", "true");
  });

  test("reduced motion publishes without the travel", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    const d = await openPlayground(page);
    await d.field("Headline").fill("Autumn menu");
    await d.publish.click();
    await expect(d.status).toHaveText("Published to website and app", { timeout: 300 });
    await expect(d.demo.getByTestId("publish-travel")).toHaveCount(0);
  });

  test("empty fields fall back to a placeholder name", async ({ page }) => {
    const d = await openPlayground(page);
    for (const name of ["Business name", "Announcement", "Headline", "Description"]) await d.field(name).fill("");
    await expect(d.web).toContainText("Your business");
    await expect(d.phone).toContainText("Your business");
    await expect(d.web.getByTestId("announcement")).toHaveCount(0);
  });

  test("reset restores the sample", async ({ page }) => {
    const d = await openPlayground(page);
    await d.field("Headline").fill("Autumn menu");
    await d.demo.getByRole("button", { name: "Reset" }).click();
    await expect(d.field("Business name")).toHaveValue("Harbour Café");
    await expect(d.status).toHaveText("Published to website and app");
  });

  test("page text formats with the toolbar", async ({ page }) => {
    const d = await openPlayground(page);
    const editor = await openPageText(page, d.demo);
    await replaceAll(page, editor, "Soup of the day");
    await page.keyboard.press("ControlOrMeta+A");
    const bold = d.demo.getByRole("toolbar", { name: "Formatting" }).getByRole("button", { name: "Bold" });
    await bold.click();
    await expect(bold).toHaveAttribute("aria-pressed", "true");
    await expect(d.web.locator("strong")).toContainText("Soup of the day");
    await expect(d.phone.locator("strong")).toContainText("Soup of the day");
  });

  test("the formatting toolbar moves with arrow keys", async ({ page }) => {
    const d = await openPlayground(page);
    await openPageText(page, d.demo);
    const toolbar = d.demo.getByRole("toolbar", { name: "Formatting" });
    await toolbar.getByRole("button", { name: "Bold" }).focus();
    await page.keyboard.press("ArrowRight");
    await expect(toolbar.getByRole("button", { name: "Italic" })).toBeFocused();
    await page.keyboard.press("End");
    await expect(toolbar.getByRole("button", { name: "Numbered list" })).toBeFocused();
  });

  test("long words wrap at 360 px and inside both previews", async ({ page }) => {
    const d = await openPlayground(page, 360);
    await d.field("Headline").fill("a".repeat(200));
    await d.field("Business name").fill("b".repeat(120));
    expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(0);
    await page.setViewportSize({ width: 1024, height: 900 });
    for (const preview of [d.web, d.phone]) {
      for (const text of await preview.locator("h3, p, span").all()) {
        const fits = await text.evaluate((el) => el.scrollWidth <= el.clientWidth + 1);
        expect(fits).toBe(true);
      }
    }
  });

  test("phone width switches previews with tabs", async ({ page }) => {
    const d = await openPlayground(page, 390);
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

  test("playground works from the keyboard", async ({ page }) => {
    const d = await openPlayground(page);
    await d.field("Business name").focus();
    await page.keyboard.press("End");
    await page.keyboard.type(" Quayside");
    await expect(d.status).toHaveText("Unpublished changes");
    for (let i = 0; i < 30 && !(await d.publish.evaluate((el) => el === document.activeElement)); i++) {
      await page.keyboard.press("Tab");
    }
    await expect(d.publish).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(d.status).toHaveText("Published to website and app");
    // Publishing must not drop keyboard focus to the page.
    await expect(d.publish).toBeFocused();
    await expect(d.publish).toHaveAttribute("aria-disabled", "true");
  });
});

test.describe("pricing", () => {
  test("pricing shows three plans as early access", async ({ page }) => {
    const response = await page.goto("/pricing");
    expect(response?.status()).toBe(200);
    // Each plan is a direct child; its feature list nests further items.
    const plans = page.getByRole("list", { name: "Plans" }).locator(":scope > li");
    await expect(plans).toHaveCount(3);
    await expect(page.getByText("Early access pricing")).toBeVisible();
    await expect(page.getByRole("link", { name: "Talk to us" })).toHaveAttribute("href", "/contact");
    const signups = plans.getByRole("link").filter({ hasNotText: "Talk to us" });
    await expect(signups).toHaveCount(2);
    for (const link of await signups.all()) await expect(link).toHaveAttribute("href", "/signup");
  });

  test("pricing makes no commitments nobody agreed to", async ({ page }) => {
    await page.goto("/pricing");
    const main = page.getByRole("main");
    await expect(main.getByText("at least a year")).toHaveCount(0);
    await expect(main.getByText("Yes, at any time")).toHaveCount(0);
  });

  test("comparison table scrolls inside its box on phones", async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 900 });
    await page.goto("/pricing");
    await expect(page.getByRole("table")).toHaveCount(1);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });
});

test.describe("about and contact", () => {
  test("about lists the team", async ({ page }) => {
    const response = await page.goto("/about");
    expect(response?.status()).toBe(200);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    const team = page.getByRole("list", { name: "Team" }).locator(":scope > li");
    await expect(team).toHaveCount(TEAM.length);
    for (const person of TEAM) {
      await expect(team.filter({ hasText: person.name })).toContainText(person.role);
    }
  });

  test("contact offers email and socials without a form", async ({ page }) => {
    const response = await page.goto("/contact");
    expect(response?.status()).toBe(200);
    const main = page.getByRole("main");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(main.locator(`a[href="mailto:${CONTACT_EMAIL}"]`)).toHaveCount(1);
    for (const social of SOCIAL_LINKS) {
      await expect(main.locator(`a[href="${social.href}"]`)).toHaveCount(1);
    }
    await expect(main.locator("form")).toHaveCount(0);
  });
});

test.describe("hero motion", () => {
  test("draft rings leave the hub and arrive published", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    const field = page.getByTestId("flow-field");
    await expect(field).toHaveAttribute("data-state", "running");
    await expect.poll(async () => Number(await field.getAttribute("data-flowed")), { timeout: 15000 }).toBeGreaterThan(0);
  });

  test("the pointer publishes draft rings it passes", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    const field = page.getByTestId("flow-field");
    await expect(field).toHaveAttribute("data-state", "running");
    const lanes = (await field.boundingBox())!;
    const hub = (await page.locator('[data-flow="source"]').boundingBox())!;
    // Sweep back and forth beside the hub, where rings are still drafts.
    for (let pass = 0; pass < 8; pass++) {
      for (let y = lanes.y + 20; y < lanes.y + lanes.height; y += 24) {
        for (const x of [hub.x - 60, hub.x - 30, hub.x + hub.width + 30, hub.x + hub.width + 60]) {
          await page.mouse.move(x, y);
        }
      }
    }
    await expect.poll(async () => Number(await field.getAttribute("data-published"))).toBeGreaterThan(0);
  });

  test("hero illustration tilts with the pointer and settles", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    const tilt = page.getByTestId("hero-tilt");
    const box = (await tilt.boundingBox())!;
    await page.mouse.move(box.x + box.width * 0.9, box.y + box.height * 0.1);
    await expect.poll(() => tilt.evaluate((el) => el.style.transform)).toContain("rotateX");
    await expect.poll(() => tilt.evaluate((el) => el.style.transform)).not.toContain("rotateX(0deg) rotateY(0deg)");
    await page.mouse.move(5, 890);
    await expect.poll(() => tilt.evaluate((el) => el.style.transform)).toContain("rotateX(0deg) rotateY(0deg)");
  });

  test("reduced motion keeps the hero still", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    await expect(page.getByTestId("flow-field")).toHaveAttribute("data-state", "static");
    const tilt = page.getByTestId("hero-tilt");
    const box = (await tilt.boundingBox())!;
    await page.mouse.move(box.x + box.width * 0.9, box.y + box.height * 0.1);
    await page.waitForTimeout(300);
    expect(await tilt.evaluate((el) => el.style.transform)).toBe("");
  });

  test("hero fits at 360 px", async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 800 });
    await page.goto("/");
    await expect(page.getByTestId("flow-field")).toHaveCount(1);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });
});

test.describe("brand refresh", () => {
  async function shape(locator: import("@playwright/test").Locator) {
    return locator.evaluate((el) => {
      const style = getComputedStyle(el);
      return { radius: parseFloat(style.borderTopLeftRadius), height: el.getBoundingClientRect().height, weight: Number(style.fontWeight) };
    });
  }

  test("buttons are bold pills on the site and in the app", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    const cta = await shape(page.getByRole("banner").getByRole("link", { name: "Get started" }));
    expect(cta.radius).toBeGreaterThanOrEqual(cta.height / 2 - 1);
    expect(cta.weight).toBeGreaterThanOrEqual(600);
    await page.goto("/signin");
    const submit = await shape(page.getByRole("button", { name: "Sign in" }));
    expect(submit.radius).toBeGreaterThanOrEqual(submit.height / 2 - 1);
    expect(submit.weight).toBeGreaterThanOrEqual(600);
  });

  test("the hero headline uses the large scale on desktop only", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    const h1 = page.getByRole("heading", { level: 1 });
    expect(await h1.evaluate((el) => parseFloat(getComputedStyle(el).fontSize))).toBeGreaterThanOrEqual(56);
    await page.setViewportSize({ width: 390, height: 900 });
    expect(await h1.evaluate((el) => parseFloat(getComputedStyle(el).fontSize))).toBeLessThanOrEqual(44);
  });

  test("irregular shapes sit behind the hero", async ({ page }) => {
    await page.goto("/");
    const shapes = page.getByTestId("hero-shapes").first();
    await expect(shapes).toHaveAttribute("aria-hidden", "true");
    expect(await shapes.locator("path").count()).toBeGreaterThanOrEqual(2);
  });
});
