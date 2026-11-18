import { expect, test, type Locator, type Page } from "@playwright/test";

const story = (id: string) => `/iframe.html?id=${id}&viewMode=story`;

/** Escape, or a press of the named button inside the modal. */
const escape = (page: Page) => page.keyboard.press("Escape");
const press = (name: string) => (_page: Page, modal: Locator) =>
  modal.getByRole("button", { name }).click();

// A <dialog> animates out only while it is still in the DOM, so the library calls `onClose` (where
// the parent unmounts it) after the exit transition has ended. Esc, the footer button and the close
// button all go through the <dialog>'s own close.
for (const [id, name, closer, close] of [
  ["feedback-dialog--default", "Delete build", "Esc", escape],
  ["feedback-dialog--default", "Delete build", "Cancel", press("Cancel")],
  ["feedback-drawer--default", "HC-65 · Tabs", "Esc", escape],
  ["feedback-drawer--default", "HC-65 · Tabs", "Close", press("Close")],
] as const) {
  test(`${id} stays on screen while it animates out, then unmounts (${closer})`, async ({
    page,
  }) => {
    await page.goto(story(id));
    const modal = page.getByRole("dialog");
    await expect(modal).toBeVisible();
    // The enter transition has finished: every animation on the dialog has settled.
    await modal.evaluate((el) =>
      Promise.all(el.getAnimations({ subtree: true }).map((animation) => animation.finished)),
    );
    await expect(modal).toHaveAccessibleName(name);

    // No clock: each exit transition is paused halfway as it starts, read there, then finished.
    await page.evaluate(() =>
      document.addEventListener("transitionrun", (event) => {
        if (!(event.target instanceof HTMLDialogElement)) return;
        for (const animation of event.target.getAnimations({ subtree: true })) {
          if (animation.playState !== "running") continue;
          animation.pause();
          const { delay = 0, duration } = animation.effect?.getComputedTiming() ?? {};
          animation.currentTime = delay + (typeof duration === "number" ? duration : 0) / 2;
        }
      }),
    );

    await close(page, modal);

    // Closed, so the page is no longer inert, but the element is still there, partway through its exit.
    await expect
      .poll(() =>
        page.evaluate(
          () =>
            document
              .querySelector("dialog")
              ?.getAnimations({ subtree: true })
              .filter((a) => a.playState === "paused").length ?? 0,
        ),
      )
      .toBeGreaterThan(0);
    const mid = await page.evaluate(() => {
      const el = document.querySelector("dialog");
      return { present: el !== null, open: el?.open ?? false };
    });
    expect(mid).toEqual({ present: true, open: false });
    // Let the exit end, so `exitTransitions` resolves and `onClose` runs.
    await page.evaluate(() =>
      document
        .querySelector("dialog")
        ?.getAnimations({ subtree: true })
        .forEach((a) => a.finish()),
    );

    // Then onClose ran and the story unmounted it.
    await expect(page.getByRole("dialog", { includeHidden: true })).toHaveCount(0);
  });
}

test("Dialog: with reduced motion it closes at once", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(story("feedback-dialog--default"));
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog", { includeHidden: true })).toHaveCount(0, { timeout: 150 });
});
