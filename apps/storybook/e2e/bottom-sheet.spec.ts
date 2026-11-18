import { expect, test, type Locator, type Page } from "@playwright/test";

/**
 * BottomSheet over a dummy full-screen view: the handle steps the snaps from the keyboard, the view
 * behind stays usable, a drag of the handle lands on a snap, and a scroll in the body never scrolls
 * the page. The story prints `Snap n of 3` from `onSnapChange`; every assertion reads that line or a
 * role, never a class or a pixel. Reduced motion switches the settle off, so a box read after a snap
 * change is the resting one (no wait on a transition).
 */
const story = (id: string) => `/iframe.html?id=feedback-bottomsheet--${id}&viewMode=story`;

async function open(page: Page, id: string, size = { width: 390, height: 700 }) {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize(size);
  await page.goto(story(id));
  const sheet = page.getByRole("region", { name: "Shops" });
  await sheet.waitFor();
  const handle = sheet.getByRole("button", { name: "Shops", exact: true });
  return { sheet, handle };
}

const snapLine = (page: Page, n: number) => page.getByText(`Snap ${n} of 3`);

/** The centre of `target` on screen, read only to aim a real pointer or touch at it. */
const centre = (target: Locator) =>
  target.evaluate((el) => {
    const { left, top, width, height } = el.getBoundingClientRect();
    return { x: left + width / 2, y: top + height / 2 };
  });

/** Drag the handle's centre to `y` with the mouse (real pointer events in every engine). */
async function dragTo(page: Page, handle: Locator, y: number) {
  const { x, y: from } = await centre(handle);
  await page.mouse.move(x, from);
  await page.mouse.down();
  await page.mouse.move(x, y, { steps: 12 });
  await page.mouse.up();
}

test.describe("keyboard", () => {
  test("Tab reaches the handle; Enter and Space step it up, Escape returns it to the first", async ({
    page,
  }) => {
    const { handle } = await open(page, "default");
    await expect(snapLine(page, 1)).toBeVisible();
    // The view's last pin comes before the sheet: one Tab from it reaches the handle.
    await page.getByRole("button", { name: "Pin C" }).focus();
    await page.keyboard.press("Tab");
    await expect(handle).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(handle).toHaveAttribute("aria-expanded", "true");
    await expect(snapLine(page, 2)).toBeVisible();
    await page.keyboard.press("Space");
    await expect(snapLine(page, 3)).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(snapLine(page, 1)).toBeVisible();
    await expect(handle).toHaveAttribute("aria-expanded", "false");
    await expect(handle).toBeFocused();
  });
});

test("is not modal: a pin behind the open sheet can be focused and pressed", async ({ page }) => {
  const { handle } = await open(page, "default");
  await handle.click();
  await expect(snapLine(page, 2)).toBeVisible();
  const pin = page.getByRole("button", { name: "Pin A" });
  await pin.focus();
  await expect(pin).toBeFocused();
  await pin.click();
  await expect(page.getByText("Pins pressed: 1")).toBeVisible();
});

test.describe("drag", () => {
  test.use({ hasTouch: true });

  test("a drag of the handle lands on the snap it is released nearest", async ({ page }) => {
    const { handle } = await open(page, "default");
    await dragTo(page, handle, 1);
    await expect(snapLine(page, 3)).toBeVisible();
    await dragTo(page, handle, 699);
    await expect(snapLine(page, 1)).toBeVisible();
    await dragTo(page, handle, 350);
    await expect(snapLine(page, 2)).toBeVisible();
  });

  test("a touch drag of the handle to the top lands on the last snap", async ({ page }) => {
    const { handle } = await open(page, "default");
    const { x, y: from } = await centre(handle);
    const cdp = await page.context().newCDPSession(page);
    await cdp.send("Input.dispatchTouchEvent", {
      type: "touchStart",
      touchPoints: [{ x, y: from }],
    });
    for (let i = 1; i <= 12; i += 1) {
      await cdp.send("Input.dispatchTouchEvent", {
        type: "touchMove",
        touchPoints: [{ x, y: from - ((from - 1) * i) / 12 }],
      });
    }
    await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
    await expect(snapLine(page, 3)).toBeVisible();
  });
});

/**
 * Open ScrollingPage with the sheet at its second snap. Returns the body's last shop (on screen
 * only once the body has scrolled to its end) and the centre of a shop near the body's middle,
 * where the pointer or finger goes.
 */
async function bodyAtSnap2(page: Page) {
  const { sheet, handle } = await open(page, "scrolling-page");
  await handle.click();
  await expect(snapLine(page, 2)).toBeVisible();
  const last = sheet.getByText("31 Long Street", { exact: true });
  await expect(last).not.toBeInViewport();
  return { last, ...(await centre(sheet.getByText("13 Long Street", { exact: true }))) };
}

const pageScroll = (page: Page) => page.evaluate(() => window.scrollY);

test.describe("scroll containment", () => {
  test.use({ hasTouch: true });

  test("wheeling far past the body's end scrolls the body, never the page", async ({ page }) => {
    const { last, x, y } = await bodyAtSnap2(page);
    expect(await page.evaluate(() => document.documentElement.scrollHeight > innerHeight)).toBe(
      true,
    );
    await page.mouse.move(x, y);
    for (let i = 0; i < 6; i += 1) await page.mouse.wheel(0, 1500);
    await expect(last).toBeInViewport({ ratio: 1 });
    for (let i = 0; i < 4; i += 1) await page.mouse.wheel(0, 1500);
    await expect(last).toBeInViewport({ ratio: 1 });
    expect(await pageScroll(page)).toBe(0);
  });

  test("a touch fling over the body never scrolls the page", async ({ page }) => {
    const { last, x, y } = await bodyAtSnap2(page);
    const cdp = await page.context().newCDPSession(page);
    // Ten swipes up (1500px, past the body's end), each a finger dragged 150px over the body in 10 moves, then lifted.
    for (let swipe = 0; swipe < 10; swipe += 1) {
      await cdp.send("Input.dispatchTouchEvent", {
        type: "touchStart",
        touchPoints: [{ x, y: y + 75 }],
      });
      for (let i = 1; i <= 10; i += 1) {
        await cdp.send("Input.dispatchTouchEvent", {
          type: "touchMove",
          touchPoints: [{ x, y: y + 75 - 15 * i }],
        });
      }
      await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
    }
    await expect(last).toBeInViewport({ ratio: 1 });
    expect(await pageScroll(page)).toBe(0);
  });
});

for (const width of [390, 768]) {
  test(`at ${width}px, the sheet shows and Enter steps its snap`, async ({ page }) => {
    const { sheet, handle } = await open(page, "default", { width, height: 700 });
    await expect(sheet).toBeVisible();
    await handle.focus();
    await page.keyboard.press("Enter");
    await expect(snapLine(page, 2)).toBeVisible();
  });
}
