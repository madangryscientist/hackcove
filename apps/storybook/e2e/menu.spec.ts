import { expect, test } from "@playwright/test";
import { themeFiles } from "@hackcove/themes-shared/files";

// One theme per CSS file in themes/, like the toolbar switcher.
const themes = themeFiles(`${import.meta.dirname}/../../../themes`).map((theme) => theme.id);

const story = (id: string, theme: string) =>
  `/iframe.html?id=${id}&viewMode=story&globals=theme:${theme}`;

for (const theme of ["default", ...themes]) {
  test(`Menu: the keyboard opens it, chooses an action and returns focus (${theme})`, async ({
    page,
  }) => {
    await page.goto(story("actions-menu--closed", theme));
    const trigger = page.getByRole("button", { name: "More actions" });
    await expect(trigger).toBeVisible();

    await page.keyboard.press("Tab");
    await expect(trigger).toBeFocused();
    await page.keyboard.press("Enter");
    const menu = page.getByRole("menu", { name: "More actions" });
    await expect(menu).toBeVisible();
    await expect(menu.getByRole("menuitem", { name: "Favourite" })).toBeFocused();

    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Enter");
    await expect(page.getByText("Archived")).toBeVisible();
    await expect(menu).toBeHidden();
    await expect(trigger).toBeFocused();
  });

  test(`Menu in a Dialog opens in view, picks an item and Escape closes only the menu (${theme})`, async ({
    page,
  }) => {
    await page.goto(story("actions-menu--in-dialog", theme));
    const modal = page.getByRole("dialog", { name: "Chat with Ada" });
    await expect(modal).toBeVisible();

    const trigger = modal.getByRole("button", { name: "More actions" });
    await trigger.click();
    const menu = page.getByRole("menu", { name: "More actions" });
    await expect(menu).toBeVisible();
    await expect(menu).toBeInViewport({ ratio: 1 });
    await expect(menu.getByRole("menuitem", { name: "Favourite" })).toBeFocused();

    // Escape closes the menu, not the dialog, and focus goes back to the trigger.
    await page.keyboard.press("Escape");
    await expect(menu).toBeHidden();
    await expect(modal).toBeVisible();
    await expect(trigger).toBeFocused();

    // A real pointer reaches an item: the click lands on it, not on the modal's inert layer.
    await trigger.click();
    await menu.getByRole("menuitem", { name: "Hide chat" }).click();
    await expect(modal.getByText("Hidden")).toBeVisible();
    await expect(menu).toBeHidden();
    await expect(modal).toBeVisible();
  });
}
