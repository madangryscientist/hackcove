import { expect, test } from "@playwright/test";

// An unknown URL is a real 404: Cloudflare Pages answers one with the build's own 404.html and status
// 404, and the e2e server does the same. The sitemap and robots.txt are build output, checked from
// `dist/` in `test/built.test.ts`.

test("/ui/no-such-page/ is a 404 in the site frame, with the way home", async ({ page }) => {
  const response = await page.goto("/ui/no-such-page/");
  expect(response?.status()).toBe(404);
  await expect(page.getByRole("banner")).toBeVisible();
  await expect(page.getByRole("heading", { level: 1, name: "Page not found" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Back to home" })).toHaveAttribute("href", "/");
});
