import { expect, test, type Locator, type Page } from "@playwright/test";

/**
 * A windowed Dialog is capped to the viewport and scrolls its body, so a tall one keeps its title
 * and its footer on screen. Run at a desktop height (720px) and at
 * the phone size appshell-phone.spec.ts uses (390 x 700).
 */
const desktop = { name: "720px high", width: 1280, height: 720 };
const phone = { name: "phone", width: 390, height: 700 };
const sizes = [desktop, phone];

const open = async (page: Page, id: string, size: typeof desktop) => {
  await page.setViewportSize({ width: size.width, height: size.height });
  await page.goto(`/iframe.html?id=${id}&viewMode=story`);
  const modal = page.getByRole("dialog");
  await expect(modal).toBeVisible();
  // The slide-in has finished: every animation on the dialog has settled, so it is where it will stay.
  await modal.evaluate((el) =>
    Promise.all(el.getAnimations({ subtree: true }).map((animation) => animation.finished)),
  );
  return modal;
};

/** The body's own tab stop: a group named by the dialog's title, there only while it holds one. */
const bodyStop = (modal: Locator, title: string) => modal.getByRole("group", { name: title });

for (const size of sizes) {
  test(`Tall, ${size.name}: the footer button is fully on screen and the body's last line is reached by scrolling the body`, async ({
    page,
  }) => {
    const modal = await open(page, "feedback-dialog--tall", size);
    const accept = modal.getByRole("button", { name: "Accept" });
    const last = modal.getByText(/^14\./);

    await expect(modal.getByRole("heading", { name: "Terms of service" })).toBeInViewport({
      ratio: 1,
    });
    await expect(accept).toBeInViewport({ ratio: 1 });
    // The last line is below the body's edge until the body is scrolled.
    await expect(last).not.toBeInViewport({ ratio: 1 });

    await last.scrollIntoViewIfNeeded();
    await expect(last).toBeInViewport({ ratio: 1 });
    await expect(accept).toBeInViewport({ ratio: 1 });
    await expect(modal.getByRole("heading", { name: "Terms of service" })).toBeInViewport({
      ratio: 1,
    });

    // The footer button is not covered: a real click lands on it and closes the dialog.
    await accept.click();
    await expect(modal).toBeHidden();
  });
}

// Each story with what must stay fully on screen beside the footer's buttons: the error's alert.
for (const { id, also } of [
  { id: "feedback-dialog--tall-form", also: [] },
  { id: "feedback-dialog--tall-form-error", also: ["alert"] },
  { id: "feedback-dialog--focus-at-the-bottom", also: [] },
] as const) {
  for (const size of sizes) {
    test(`${id}, ${size.name}: the footer stays on screen`, async ({ page }) => {
      const modal = await open(page, id, size);
      await expect(modal.getByRole("button", { name: "Accept" })).toBeInViewport({ ratio: 1 });
      await expect(modal.getByRole("button", { name: "Cancel" })).toBeInViewport({ ratio: 1 });
      for (const role of also) await expect(modal.getByRole(role)).toBeInViewport({ ratio: 1 });
    });
  }
}

test("a tall body of plain text is reached by Tab and scrolls with ArrowDown", async ({ page }) => {
  const modal = await open(page, "feedback-dialog--tall", desktop);
  const body = bodyStop(modal, "Terms of service");
  await expect(body).toHaveAttribute("tabindex", "0");

  // The footer's first button has first focus (the body had no tab stop when the dialog opened),
  // and the body is the stop before it.
  await modal.getByRole("button", { name: "Cancel" }).focus();
  await page.keyboard.press("Shift+Tab");
  await expect(body).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(modal.getByRole("button", { name: "Cancel" })).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  await expect(body).toBeFocused();

  const top = () => body.evaluate((el) => el.scrollTop);
  expect(await top()).toBe(0);
  await page.keyboard.press("ArrowDown");
  await expect.poll(top).toBeGreaterThan(0);
});

test("a tall form still opens with focus on its first field, and its body takes no tab stop", async ({
  page,
}) => {
  const modal = await open(page, "feedback-dialog--tall-form", desktop);
  await expect(modal.getByLabel("Name")).toBeFocused();
  await expect(bodyStop(modal, "New segment")).toHaveCount(0);
});

test("a short dialog keeps its first focus where it is, and its body takes no tab stop", async ({
  page,
}) => {
  const modal = await open(page, "feedback-dialog--default", desktop);
  await expect(bodyStop(modal, "Delete build")).toHaveCount(0);
  await expect(modal.getByRole("button", { name: "Cancel" })).toBeFocused();
});

test("a body that grows past the cap gains the tab stop, and loses it when it fits again", async ({
  page,
}) => {
  const modal = await open(page, "feedback-dialog--tall", desktop);
  const body = bodyStop(modal, "Terms of service");
  await expect(body).toHaveAttribute("tabindex", "0");
  await page.setViewportSize({ width: 1280, height: 4000 });
  await expect(bodyStop(modal, "Terms of service")).toHaveCount(0);
  await page.setViewportSize({ width: 1280, height: 720 });
  await expect(body).toHaveAttribute("tabindex", "0");
});
