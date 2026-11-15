import { expect, test, type Page } from "@playwright/test";
import { themeFiles } from "@hackcove/themes-shared/files";

/**
 * BottomSheet over a dummy full-screen view: the handle steps the snaps from the keyboard, the view
 * behind stays usable, a drag of the handle lands on a snap, and a scroll in the body never scrolls
 * the page. The story prints `Snap n of 3` from `onSnapChange`; every assertion reads that line or a
 * role, never a class or a pixel. Reduced motion switches the settle off, so a box read after a snap
 * change is the resting one (no wait on a transition).
 */
const themes = themeFiles(`${import.meta.dirname}/../../../themes`).map((t) => t.id);

const story = (id: string, theme?: string) =>
  `/iframe.html?id=feedback-bottomsheet--${id}&viewMode=story${theme ? `&globals=theme:${theme}` : ""}`;

async function open(page: Page, id: string, size = { width: 390, height: 700 }, theme?: string) {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize(size);
  await page.goto(story(id, theme));
  const sheet = page.getByRole("region", { name: "Shops" });
  await sheet.waitFor();
  const handle = sheet.getByRole("button", { name: "Shops", exact: true });
  return { sheet, handle };
}

const snapLine = (page: Page, n: number) => page.getByText(`Snap ${n} of 3`);

/** Drag the handle's centre to `y` with the mouse (real pointer events in every engine). */
async function dragTo(page: Page, handle: ReturnType<Page["locator"]>, y: number) {
  const box = await handle.boundingBox();
  if (!box) throw new Error("the handle has no box");
  const x = box.x + box.width / 2;
  await page.mouse.move(x, box.y + box.height / 2);
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
    for (let i = 0; i < 10; i += 1) {
      await page.keyboard.press("Tab");
      if (await handle.evaluate((el) => el === document.activeElement)) break;
    }
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

  test("a touch drag of the handle to the top lands on the last snap", async ({
    page,
    browserName,
  }) => {
    test.skip(
      browserName !== "chromium",
      "touch input is dispatched through CDP, which only Chromium has",
    );
    const { handle } = await open(page, "default");
    const box = await handle.boundingBox();
    if (!box) throw new Error("the handle has no box");
    const x = box.x + box.width / 2;
    const from = box.y + box.height / 2;
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

/** Open ScrollingPage with the sheet at its second snap; returns the body's centre. */
async function bodyAtSnap2(page: Page) {
  const { handle } = await open(page, "scrolling-page");
  await handle.click();
  await expect(snapLine(page, 2)).toBeVisible();
  const id = await handle.getAttribute("aria-controls");
  const body = page.locator(`[id="${id}"]`);
  const box = await body.boundingBox();
  if (!box) throw new Error("the body has no box");
  return { body, x: box.x + box.width / 2, y: box.y + box.height / 2 };
}

const atEnd = (body: ReturnType<Page["locator"]>) =>
  body.evaluate((el) => el.scrollTop + el.clientHeight >= el.scrollHeight - 1);

const pageScroll = (page: Page) => page.evaluate(() => window.scrollY);

test.describe("scroll containment", () => {
  test.use({ hasTouch: true });

  test("wheeling far past the body's end scrolls the body, never the page", async ({ page }) => {
    const { body, x, y } = await bodyAtSnap2(page);
    expect(await page.evaluate(() => document.documentElement.scrollHeight > innerHeight)).toBe(
      true,
    );
    await page.mouse.move(x, y);
    for (let i = 0; i < 6; i += 1) await page.mouse.wheel(0, 1500);
    await expect.poll(() => atEnd(body)).toBe(true);
    for (let i = 0; i < 4; i += 1) await page.mouse.wheel(0, 1500);
    await expect.poll(() => atEnd(body)).toBe(true);
    expect(await pageScroll(page)).toBe(0);
  });

  test("a touch fling over the body never scrolls the page", async ({ page, browserName }) => {
    test.skip(
      browserName !== "chromium",
      "touch input is dispatched through CDP, which only Chromium has",
    );
    const { body, x, y } = await bodyAtSnap2(page);
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
    await expect.poll(() => atEnd(body)).toBe(true);
    expect(await pageScroll(page)).toBe(0);
  });
});

for (const width of [390, 768]) {
  for (const theme of themes) {
    test(`at ${width}px in ${theme}, the sheet shows and Enter steps its snap`, async ({
      page,
    }) => {
      const { sheet, handle } = await open(page, "default", { width, height: 700 }, theme);
      await expect(sheet).toBeVisible();
      await handle.focus();
      await page.keyboard.press("Enter");
      await expect(snapLine(page, 2)).toBeVisible();
    });
  }
}
