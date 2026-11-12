import { expect, test } from "@playwright/test";
import { site } from "../src/content/site";
import { setScheme, toggle } from "./scheme";

// The header is one row from `md`: the brand, the section links and the toggle, not a second row for
// the links. 56px for the row and 1px for its bottom border, the same height as the phone header.
const HEADER = 57;
const paths = ["/", "/ui/", "/ui/button/"];

for (const width of [1440, 768]) {
  for (const scheme of ["light", "dark"] as const) {
    test(`at ${width}px under ${scheme} the header is one row with the section links and the toggle, and the page does not scroll sideways`, async ({
      page,
    }) => {
      test.setTimeout(120_000);
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/");
      await setScheme(page, scheme);
      for (const path of paths) {
        await page.goto(path);
        await toggle(page).waitFor();
        const header = page.getByRole("banner");
        const box = await header.boundingBox();
        expect(box?.height, `${path}: header height`).toBe(HEADER);
        const nav = header.getByRole("navigation", { name: "Sections" });
        for (const { navLabel } of site.sections) {
          const link = nav.getByRole("link", { name: navLabel });
          await expect(link, `${path}: ${navLabel}`).toBeVisible();
          const at = await link.boundingBox();
          expect(at && at.y >= (box?.y ?? 0) && at.y + at.height <= (box?.y ?? 0) + HEADER).toBe(
            true,
          );
        }
        await expect(toggle(page)).toBeVisible();
        const overflow = await page.evaluate(
          () => document.documentElement.scrollWidth - window.innerWidth,
        );
        expect(overflow, `${path}: sideways scroll`).toBeLessThanOrEqual(0);
      }
    });
  }
}

test("on /ui/button/ at 1440x900 the docs rail starts at the header's bottom edge", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/ui/button/");
  const header = await page.getByRole("banner").boundingBox();
  const rail = await page.getByRole("complementary", { name: "All components" }).boundingBox();
  if (!header || !rail) throw new Error("no box");
  expect(rail.y, "no gap the height of the old second row").toBeLessThanOrEqual(
    header.y + header.height + 32,
  );
  expect(rail.y).toBeGreaterThanOrEqual(header.y + header.height);
});
