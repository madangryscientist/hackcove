import { expect, test } from "@playwright/test";

const story = (id: string) => `/iframe.html?id=${id}&viewMode=story`;

// A <dialog> animates out only while it is still in the DOM, so the library calls `onClose` (where
// the parent unmounts it) after the exit transition has ended. Esc, the footer button and the close
// button all go through the <dialog>'s own close.
for (const [id, name, closer] of [
  ["ui-dialog--default", "Delete build", "Esc"],
  ["ui-dialog--default", "Delete build", "Cancel"],
  ["ui-drawer--default", "HC-65 · Tabs", "Esc"],
  ["ui-drawer--default", "HC-65 · Tabs", "Close"],
] as const) {
  test(`${id} stays on screen while it animates out, then unmounts (${closer})`, async ({
    page,
  }) => {
    await page.goto(story(id));
    const modal = page.getByRole("dialog");
    await expect(modal).toBeVisible();
    // The enter transition has finished.
    await expect(modal).toHaveCSS("opacity", "1");
    await expect(modal).toHaveAccessibleName(name);

    if (closer === "Esc") await page.keyboard.press("Escape");
    else await modal.getByRole("button", { name: closer }).click();

    // Closed, so the page is no longer inert, but the element is still there, still drawn, partway through its exit.
    const mid = await page.evaluate(
      () =>
        new Promise<{ present: boolean; open: boolean; display: string }>((resolve) => {
          setTimeout(() => {
            const el = document.querySelector("dialog");
            resolve({
              present: el !== null,
              open: el?.open ?? false,
              display: el ? getComputedStyle(el).display : "none",
            });
          }, 60);
        }),
    );
    expect(mid).toEqual({
      present: true,
      open: false,
      display: expect.not.stringMatching(/^none$/),
    });

    // Then onClose ran and the story unmounted it.
    await expect(page.locator("dialog")).toHaveCount(0);
  });
}

test("Dialog: with reduced motion it closes at once", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(story("ui-dialog--default"));
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.locator("dialog")).toHaveCount(0, { timeout: 150 });
});
