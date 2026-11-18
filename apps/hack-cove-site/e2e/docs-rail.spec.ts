import { expect, test, type Locator } from "@playwright/test";

// HC-259: the rail shows where you are. The frame hydrates (the rail's effects run on the site), so a
// page low in the list has its current link scrolled into view inside the rail, and the rail's
// scrollbar is the thin themed one. The phone's folded rail is docs-rail.phone.spec.ts.
const boxOf = async (locator: Locator) => {
  const box = await locator.boundingBox();
  if (!box) throw new Error("no box");
  return box;
};

test("/ui/button/ on a desktop has its current link in view in the rail, and the page has not moved", async ({
  page,
}) => {
  await page.goto("/ui/button/");
  const scroller = page.getByRole("complementary", { name: "All components" }).locator("> div");
  const current = scroller.locator("[aria-current]");
  await expect(current).toHaveText("Button");
  await expect.poll(() => scroller.evaluate((el) => el.scrollTop)).toBeGreaterThan(0);
  const [box, at] = await Promise.all([boxOf(scroller), boxOf(current)]);
  expect(at.y, "the current link is below the rail's top").toBeGreaterThanOrEqual(box.y);
  expect(at.y + at.height, "the current link is above the rail's end").toBeLessThanOrEqual(
    box.y + box.height,
  );
  expect(await page.evaluate(() => window.scrollY), "the page did not move").toBe(0);
  // The fade (HC-251) is live on the site, and the scrollbar is the thin themed one.
  await expect(scroller).toHaveAttribute("data-more", "");
  expect(await scroller.evaluate((el) => getComputedStyle(el).scrollbarWidth)).toBe("thin");
});
