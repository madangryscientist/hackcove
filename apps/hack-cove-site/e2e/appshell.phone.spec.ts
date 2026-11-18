import { expect, test } from "@playwright/test";
import { site } from "../src/content/site";

// Every page shares the one AppShell header, so one page proves its phone menu; how each page's
// header looks in each theme is the visual check's.
test("on a phone the section nav is behind the Menu button, and every section is reachable", async ({
  page,
}) => {
  await page.goto("/");
  // The Menu is a native `<details>` (a group); its `<summary>` is the button, found by its text.
  const menu = page.getByRole("banner").getByRole("group");
  const button = menu.getByText("Menu", { exact: true });
  await expect(button).toBeVisible();
  await expect(menu.getByRole("link").first()).toBeHidden();
  await button.click();
  await expect(menu).toHaveJSProperty("open", true);
  const links = menu.getByRole("link");
  await expect(links, "the menu lists every section").toHaveCount(site.sections.length);
  for (const [index, { navLabel }] of site.sections.entries()) {
    await expect(links.nth(index)).toHaveText(navLabel);
    await expect(links.nth(index)).toBeInViewport({ ratio: 1 });
  }
});
