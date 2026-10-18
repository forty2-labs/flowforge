import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

// One walkthrough per width and theme: sign up, create a workspace, visit
// every section, invite someone and open the link. Each screen is checked
// for serious accessibility violations and sideways scrolling, then saved to
// test-results/screens/<theme>/<width>/ for a person to look at. The theme
// comes from the device setting, which is what "System" follows.
const WIDTHS = [390, 1440];
const THEMES = ["light", "dark"] as const;

async function check(page: Page, dir: string, name: string) {
  // Streamed sections render after the loading boundary, so wait for the title.
  await page.locator("h1").first().waitFor();
  await page.waitForLoadState("networkidle");
  // Next.js's dev badge is not part of the app.
  await page.addStyleTag({ content: "nextjs-portal { display: none !important; }" });
  // Contrast is measured on the settled screen, not mid-fade.
  await page.waitForFunction(() =>
    document.getAnimations().every((animation) => animation.playState !== "running"),
  );
  const { violations } = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
    .analyze();
  const serious = violations
    .filter((v) => v.impact === "serious" || v.impact === "critical")
    .map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`);
  expect(serious, `${name}: accessibility`).toEqual([]);

  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth,
  );
  expect(overflow, `${name}: sideways scroll`).toBeLessThanOrEqual(0);

  await page.screenshot({
    path: `test-results/screens/${dir}/${name}.png`,
    fullPage: true,
  });
}

for (const theme of THEMES) for (const width of WIDTHS) {
  test(`screens at ${width}px in ${theme}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ colorScheme: theme });
    const dir = `${theme}/${width}`;
    const stamp = `${Date.now()}-${theme}-${width}`;

    await page.goto("/signin");
    await check(page, dir, "01-signin");

    await page.goto("/signup");
    await check(page, dir, "02-signup");
    await page.getByLabel("Your name").fill("Maya Ortiz");
    await page.getByLabel("Work email").fill(`visual+${stamp}@example.com`);
    await page.getByLabel("Password").fill("northstar2026");
    await page.getByRole("button", { name: "Create account" }).click();

    await page.waitForURL("**/workspaces/new");
    await check(page, dir, "03-new-workspace");
    await page.getByLabel("Workspace name").fill("Northstar Studio");
    await page.getByRole("button", { name: "Create workspace" }).click();

    await page.waitForURL(/\/w\/[^/]+$/);
    const base = new URL(page.url()).pathname;
    await check(page, dir, "04-overview");

    // On phones the navigation sits in a drawer behind the menu button.
    const phone = width < 768;
    const menu = page.getByRole("button", { name: "Menu" });
    if (phone) {
      await menu.click();
      await expect(page.getByRole("dialog", { name: "Menu" })).toBeVisible();
      await check(page, dir, "04a-menu-open");
    }

    // The workspace switcher works from the keyboard alone.
    const switcher = page.getByRole("button", { name: /Switch workspace/ });
    await switcher.focus();
    await page.keyboard.press("Enter");
    await expect(
      page.getByRole("list", { name: "Your workspaces" }).getByRole("link", { name: /Northstar Studio/ }),
    ).toBeFocused();
    await page.keyboard.press("ArrowDown");
    await expect(page.getByRole("link", { name: "Create workspace" })).toBeFocused();
    await check(page, dir, "04b-switcher-open");
    await page.keyboard.press("Escape");
    await expect(switcher).toBeFocused();
    await expect(page.getByRole("link", { name: "Create workspace" })).toBeHidden();

    if (phone) {
      // Esc closed only the list; a second Esc closes the drawer.
      await page.keyboard.press("Escape");
      await expect(page.getByRole("dialog", { name: "Menu" })).toBeHidden();
      await expect(menu).toBeFocused();
    } else {
      // Choosing a theme in the account menu overrides the device setting
      // and survives a reload; System hands control back to the device.
      const other = theme === "light" ? "Dark" : "Light";
      await page.getByRole("button", { name: /^Account:/ }).click();
      await check(page, dir, "04c-account-menu");
      await page.getByRole("menuitemradio", { name: other }).click();
      await expect(page.locator("html")).toHaveAttribute("data-theme", other.toLowerCase());
      await page.reload();
      await expect(page.locator("html")).toHaveAttribute("data-theme", other.toLowerCase());
      await check(page, dir, "04d-other-theme");
      await page.getByRole("button", { name: /^Account:/ }).click();
      await page.getByRole("menuitemradio", { name: "System" }).click();
      await expect(page.locator("html")).not.toHaveAttribute("data-theme");
    }

    await page.goto(`${base}/settings`);
    await page.getByRole("heading", { name: "Settings" }).waitFor();
    await check(page, dir, "05-settings");

    await page.goto(`${base}/team`);
    await page.getByRole("heading", { name: "Team" }).waitFor();
    await page.getByLabel("Email").fill(`guest+${stamp}@example.com`);
    await page.getByRole("button", { name: "Invite", exact: true }).click();
    const link = page.locator("code").first();
    await link.waitFor();
    await check(page, dir, "06-team");

    // Destructive actions ask first: focus starts on Cancel, Esc closes the
    // dialog and focus goes back to the button that opened it.
    const revoke = page.getByRole("button", { name: "Revoke", exact: true });
    await revoke.click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("button", { name: "Cancel" })).toBeFocused();
    await check(page, dir, "06b-revoke-dialog");
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(revoke).toBeFocused();

    // Copying confirms on the button.
    await page.context().grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.getByRole("button", { name: "Copy link" }).click();
    await expect(page.getByRole("button", { name: "Copied" })).toBeVisible();

    const inviteUrl = new URL((await link.textContent()) ?? "");
    await page.goto(inviteUrl.pathname);
    await page.getByRole("heading").first().waitFor();
    await check(page, dir, "07-invitation");

    // Revoking for real ends in a toast that names what changed.
    await page.goto(`${base}/team`);
    await page.getByRole("button", { name: "Revoke", exact: true }).click();
    await page.getByRole("button", { name: "Revoke invitation" }).click();
    await expect(page.getByRole("status").getByText("revoked.")).toBeVisible();
    await check(page, dir, "08-revoked-toast");
  });
}
