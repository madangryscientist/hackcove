import { expect, test } from "@playwright/test";

// HC-259: the rail shows where you are. The frame hydrates (the rail's effects run on the site), so a
// page low in the list has its current link scrolled into view inside the rail. The rail's fade and
// thin scrollbar are look, so they are the visual check's. The phone's folded rail is
// docs-rail.phone.spec.ts.
test("/ui/button/ on a desktop has its current link in view in the rail, and the page has not moved", async ({
  page,
}) => {
  await page.goto("/ui/button/");
  const rail = page.getByRole("complementary", { name: "All components" });
  const current = rail.getByRole("link", { name: "Button", exact: true });
  await expect(current).toHaveAttribute("aria-current", "page");
  // The rail scrolled: its first link went off the top, and the current link is wholly inside it
  // (in view counts the rail's own clipping, not only the window's).
  await expect(rail.getByRole("link").first()).not.toBeInViewport();
  await expect(current).toBeInViewport({ ratio: 1 });
  expect(await page.evaluate(() => window.scrollY), "the page did not move").toBe(0);
});
