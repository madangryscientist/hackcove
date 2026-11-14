import { expect, test } from "@playwright/test";

const story = (id: string) => `/iframe.html?id=${id}&viewMode=story`;

test("Switch: Space and Enter toggle it, and getByRole finds it by name", async ({ page }) => {
  await page.goto(story("forms-switch--off"));
  const flag = page.getByRole("switch", { name: "Live in staging" });
  await expect(flag).toHaveAttribute("aria-checked", "false");
  await flag.focus();
  await page.keyboard.press("Space");
  await expect(flag).toHaveAttribute("aria-checked", "true");
  await page.keyboard.press("Enter");
  await expect(flag).toHaveAttribute("aria-checked", "false");
  await expect(flag).toBeFocused();
});

test("Switch: clicking the visible label toggles it once", async ({ page }) => {
  await page.goto(story("forms-switch--off"));
  const flag = page.getByRole("switch", { name: "Live in staging" });
  await page.getByText("Live in staging", { exact: true }).click();
  await expect(flag).toHaveAttribute("aria-checked", "true");
  await page.getByText("Live in staging", { exact: true }).click();
  await expect(flag).toHaveAttribute("aria-checked", "false");
});

test("Switch: a description names nothing but describes the switch", async ({ page }) => {
  await page.goto(story("forms-switch--with-description"));
  const flag = page.getByRole("switch", { name: "Live in production" });
  await expect(flag).toHaveAccessibleDescription(
    "Serves the flag to every request in this environment.",
  );
});

test("Switch: focus stays on it through a busy cycle, and a busy click does nothing", async ({
  page,
}) => {
  await page.goto(story("forms-switch--saving"));
  const flag = page.getByRole("switch", { name: "Live in staging" });
  await flag.focus();
  await page.keyboard.press("Space");
  await expect(flag).toHaveAttribute("aria-busy", "true");
  await expect(flag).toBeFocused();
  // Still the old value while the save is in flight, and keys and clicks are ignored.
  await expect(flag).toHaveAttribute("aria-checked", "false");
  await page.keyboard.press("Enter");
  await flag.click({ force: true });
  await expect(flag).toHaveAttribute("aria-busy", "true");
  await expect(flag).toHaveAttribute("aria-checked", "false");
  // The save lands only when the caller says so: no clock.
  const land = page.getByRole("button", { name: "Save lands" });
  await land.click();
  await expect(flag).not.toHaveAttribute("aria-busy", "true");
  await expect(flag).toHaveAttribute("aria-checked", "true");
  // Idle again: the next flip goes through.
  await flag.focus();
  await page.keyboard.press("Space");
  await expect(flag).toHaveAttribute("aria-busy", "true");
  await expect(flag).toBeFocused();
  await land.click();
  await expect(flag).not.toHaveAttribute("aria-busy", "true");
  await expect(flag).toHaveAttribute("aria-checked", "false");
});

test("Switch: a bare switch in a table cell is named by its aria-label", async ({ page }) => {
  await page.goto(story("forms-switch--bare"));
  const flag = page.getByRole("switch", { name: "checkout-v2 in staging" });
  await expect(flag).toHaveAttribute("aria-checked", "false");
  await flag.click();
  await expect(flag).toHaveAttribute("aria-checked", "true");
  await expect(page.getByRole("switch", { name: "dark-mode in staging" })).toHaveAttribute(
    "aria-checked",
    "true",
  );
});

test("Switch: a disabled switch is native-disabled and ignores a click on its label", async ({
  page,
}) => {
  await page.goto(story("forms-switch--disabled"));
  const flag = page.getByRole("switch", { name: "Live in staging" });
  await expect(flag).toBeDisabled();
  await page.getByText("Live in staging", { exact: true }).click({ force: true });
  await expect(flag).toHaveAttribute("aria-checked", "false");
});
