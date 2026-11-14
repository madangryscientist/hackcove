import { expect, test } from "@playwright/test";

const story = (id: string) => `/iframe.html?id=${id}&viewMode=story`;

// A <dialog> animates out only while it is still in the DOM, so the library calls `onClose` (where
// the parent unmounts it) after the exit transition has ended. Esc, the footer button and the close
// button all go through the <dialog>'s own close.
for (const [id, name, closer] of [
  ["feedback-dialog--default", "Delete build", "Esc"],
  ["feedback-dialog--default", "Delete build", "Cancel"],
  ["feedback-drawer--default", "HC-65 · Tabs", "Esc"],
  ["feedback-drawer--default", "HC-65 · Tabs", "Close"],
] as const) {
  test(`${id} stays on screen while it animates out, then unmounts (${closer})`, async ({
    page,
    browserName,
  }) => {
    await page.goto(story(id));
    const modal = page.getByRole("dialog");
    await expect(modal).toBeVisible();
    // The enter transition has finished.
    await expect(modal).toHaveCSS("opacity", "1");
    await expect(modal).toHaveAccessibleName(name);

    // Chromium only (HC-174): Firefox and WebKit do not run the `display` discrete transition on a
    // `<dialog>` (checked: no transition starts and `display` is `none` the moment it closes), so
    // there they close with no exit animation and `onClose` unmounts it at once. That is the
    // designed fallback (`exitTransitions` waits only for transitions that are running), so the
    // mid-exit assertion is skipped there and the unmount below still runs in every engine.
    const chromium = browserName === "chromium";
    // No clock: each exit transition is paused halfway as it starts, read there, then finished.
    if (chromium)
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

    if (closer === "Esc") await page.keyboard.press("Escape");
    else await modal.getByRole("button", { name: closer }).click();

    // Closed, so the page is no longer inert, but the element is still there, still drawn, partway through its exit.
    if (chromium) {
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
        return {
          present: el !== null,
          open: el?.open ?? false,
          display: el ? getComputedStyle(el).display : "none",
        };
      });
      expect(mid).toEqual({
        present: true,
        open: false,
        display: expect.not.stringMatching(/^none$/),
      });
      // Let the exit end, so `exitTransitions` resolves and `onClose` runs.
      await page.evaluate(() =>
        document
          .querySelector("dialog")
          ?.getAnimations({ subtree: true })
          .forEach((a) => a.finish()),
      );
    }

    // Then onClose ran and the story unmounted it.
    await expect(page.locator("dialog")).toHaveCount(0);
  });
}

test("Dialog: with reduced motion it closes at once", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(story("feedback-dialog--default"));
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.locator("dialog")).toHaveCount(0, { timeout: 150 });
});
