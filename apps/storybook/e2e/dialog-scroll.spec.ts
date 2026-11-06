import { expect, test, type Page } from "@playwright/test";

/**
 * A windowed Dialog is capped to the viewport and scrolls its body, so a tall one keeps its title
 * and its footer on screen. Run in Chromium, Firefox and WebKit, at a desktop height (720px) and at
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
  // The slide-in has finished: the dialog is where it will stay.
  await expect(modal).toHaveCSS("opacity", "1");
  return modal;
};

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

for (const id of ["feedback-dialog--tall-form", "feedback-dialog--focus-at-the-bottom"]) {
  for (const size of sizes) {
    test(`${id}, ${size.name}: the footer stays on screen`, async ({ page }) => {
      const modal = await open(page, id, size);
      await expect(modal.getByRole("button", { name: "Accept" })).toBeInViewport({ ratio: 1 });
      await expect(modal.getByRole("button", { name: "Cancel" })).toBeInViewport({ ratio: 1 });
    });
  }
}

test("the dialog element itself is not clipped, so a calendar portalled into it can overflow", async ({
  page,
}) => {
  const modal = await open(page, "feedback-dialog--tall", desktop);
  await expect(modal).toHaveCSS("overflow", "visible");
});

test("a tall body of plain text is reached by Tab and scrolls with ArrowDown", async ({ page }) => {
  const modal = await open(page, "feedback-dialog--tall", desktop);
  const body = modal.getByRole("group", { name: "Terms of service" });
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
  await expect(modal.locator('[tabindex]:not([tabindex="-1"])')).toHaveCount(0);
});

test("a short dialog keeps its first focus where it is, and its body takes no tab stop", async ({
  page,
}) => {
  const modal = await open(page, "feedback-dialog--default", desktop);
  await expect(modal.locator('[tabindex]:not([tabindex="-1"])')).toHaveCount(0);
  await expect(modal.getByRole("button", { name: "Cancel" })).toBeFocused();
});

test("a body that grows past the cap gains the tab stop, and loses it when it fits again", async ({
  page,
}) => {
  const modal = await open(page, "feedback-dialog--tall", desktop);
  const body = modal.getByRole("group", { name: "Terms of service" });
  await expect(body).toHaveAttribute("tabindex", "0");
  await page.setViewportSize({ width: 1280, height: 4000 });
  await expect(modal.locator('[tabindex]:not([tabindex="-1"])')).toHaveCount(0);
  await page.setViewportSize({ width: 1280, height: 720 });
  await expect(body).toHaveAttribute("tabindex", "0");
});

test("a focused field at the top and at the bottom edge of the body shows its whole outline", async ({
  page,
}) => {
  for (const [id, label] of [
    ["feedback-dialog--focus-at-the-top", "First name"],
    ["feedback-dialog--focus-at-the-bottom", "Last name"],
  ] as const) {
    const modal = await open(page, id, desktop);
    const field = modal.getByLabel(label);
    await expect(field).toBeFocused();
    // How far the outline sits inside the scrolling body's box, top and bottom (negative: clipped),
    // with the body scrolled flush to the edge the field is at. (Where an engine's own scroll on
    // focus stops differs, so the scroll is set here.)
    const room = () =>
      field.evaluate((el, atBottom) => {
        const style = getComputedStyle(el);
        let scroller: HTMLElement | null = el.parentElement;
        while (scroller && getComputedStyle(scroller).overflowY !== "auto") {
          scroller = scroller.parentElement;
        }
        if (!scroller) throw new Error("no scrolling ancestor");
        scroller.scrollTop = atBottom ? scroller.scrollHeight : 0;
        const ring = Number.parseFloat(style.outlineWidth) + Number.parseFloat(style.outlineOffset);
        const box = el.getBoundingClientRect();
        const body = scroller.getBoundingClientRect();
        return Math.min(box.top - ring - body.top, body.bottom - (box.bottom + ring));
      }, id.endsWith("bottom"));
    await expect.poll(room).toBeGreaterThanOrEqual(-0.5);
  }
});
