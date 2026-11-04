import { expect, test } from "@playwright/test";
import { themeFiles } from "@hackcove/themes-shared/files";

// One theme per CSS file under themes/*/, like the toolbar switcher.
const themes = themeFiles(`${import.meta.dirname}/../../../themes`).map((theme) => theme.id);

// A modal <dialog> makes everything outside it inert, and react-aria portals the calendar to
// <body>: the calendar must still open, take focus and pick a day.
for (const theme of ["default", ...themes]) {
  for (const [story, label] of [
    ["forms-datefield--in-dialog", "Dialog"],
    ["forms-datefield--in-drawer", "Drawer"],
  ] as const) {
    test(`DateField calendar in a ${label} opens its calendar and picks a day (${theme})`, async ({
      page,
    }) => {
      await page.goto(`/iframe.html?id=${story}&viewMode=story&globals=theme:${theme}`);
      const modal = page.getByRole("dialog", { name: "Mark as paid" });
      await expect(modal).toBeVisible();

      await modal.getByRole("button", { name: /^Calendar/ }).click();
      const calendar = page.getByRole("grid");
      await expect(calendar).toBeVisible();
      // Not clipped by the modal's own overflow: all of it is on screen, not just reachable by scrolling.
      await expect(calendar).toBeInViewport({ ratio: 1 });

      // Reachable by a real pointer: the click lands on the cell, not on the modal's inert layer.
      await calendar
        .getByRole("gridcell", { name: /\b15\b/ })
        .first()
        .click();
      await expect(modal.getByRole("spinbutton", { name: /day/i })).toHaveText("15");
      await expect(calendar).toBeHidden();
      // The modal stays open after the pick.
      await expect(modal).toBeVisible();
    });
  }
}
