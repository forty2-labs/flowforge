import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

// One walkthrough per width: sign up, create a workspace, visit every
// section, invite someone and open the link. Each screen is checked for
// serious accessibility violations and sideways scrolling, then saved to
// test-results/screens/<width>/ for a person to look at.
const WIDTHS = [390, 1440];

async function check(page: Page, width: number, name: string) {
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
    path: `test-results/screens/${width}/${name}.png`,
    fullPage: true,
  });
}

for (const width of WIDTHS) {
  test(`screens at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    const stamp = `${Date.now()}-${width}`;

    await page.goto("/signin");
    await check(page, width, "01-signin");

    await page.goto("/signup");
    await check(page, width, "02-signup");
    await page.getByLabel("Your name").fill("Maya Ortiz");
    await page.getByLabel("Work email").fill(`visual+${stamp}@example.com`);
    await page.getByLabel("Password").fill("northstar2026");
    await page.getByRole("button", { name: "Create account" }).click();

    await page.waitForURL("**/workspaces/new");
    await check(page, width, "03-new-workspace");
    await page.getByLabel("Workspace name").fill("Northstar Studio");
    await page.getByRole("button", { name: "Create workspace" }).click();

    await page.waitForURL(/\/w\/[^/]+$/);
    const base = new URL(page.url()).pathname;
    await check(page, width, "04-overview");

    await page.goto(`${base}/settings`);
    await page.getByRole("heading", { name: "Settings" }).waitFor();
    await check(page, width, "05-settings");

    await page.goto(`${base}/team`);
    await page.getByRole("heading", { name: "Team" }).waitFor();
    await page.getByLabel("Email").fill(`guest+${stamp}@example.com`);
    await page.getByRole("button", { name: "Invite", exact: true }).click();
    const link = page.locator("code").first();
    await link.waitFor();
    await check(page, width, "06-team");

    // Destructive actions ask first: focus starts on Cancel, Esc closes the
    // dialog and focus goes back to the button that opened it.
    const revoke = page.getByRole("button", { name: "Revoke", exact: true });
    await revoke.click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("button", { name: "Cancel" })).toBeFocused();
    await check(page, width, "06b-revoke-dialog");
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(revoke).toBeFocused();

    const inviteUrl = new URL((await link.textContent()) ?? "");
    await page.goto(inviteUrl.pathname);
    await page.getByRole("heading").first().waitFor();
    await check(page, width, "07-invitation");
  });
}
