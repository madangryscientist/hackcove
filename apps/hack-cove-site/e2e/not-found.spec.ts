import { expect, test } from "@playwright/test";
import { readdirSync } from "node:fs";
import { componentPages } from "../src/content/components/index";
import { site } from "../src/content/site";

// An unknown URL is a real 404: Cloudflare Pages answers one with the build's own 404.html and status
// 404, and the e2e server does the same. The sitemap and robots.txt are build-time files, not pages.

// The top-level pages as they are in `src/pages`, the same source the sitemap reads.
const topLevel = readdirSync(new URL("../src/pages", import.meta.url))
  .filter((name) => name.endsWith(".astro"))
  .map((name) => name.slice(0, -".astro".length))
  .filter((name) => name !== "index" && name !== "404")
  .map((name) => `/${name}/`);

test("/ui/no-such-page/ is a 404 in the site frame, with the way home", async ({ page }) => {
  const response = await page.goto("/ui/no-such-page/");
  expect(response?.status()).toBe(404);
  await expect(page.getByRole("banner")).toBeVisible();
  await expect(page.getByRole("heading", { level: 1, name: "Page not found" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Back to home" })).toHaveAttribute("href", "/");
});

test("/sitemap.xml lists every page, and every page it lists is there", async ({
  page,
  request,
}) => {
  const response = await request.get("/sitemap.xml");
  expect(response.status()).toBe(200);
  expect(response.headers()["content-type"]).toContain("xml");
  // Parsed as XML, not read with a regex: an unclosed or unescaped document fails here. A loc's text
  // comes back with its entities decoded.
  const locs = await page.evaluate(
    (text) => {
      const doc = new DOMParser().parseFromString(text, "application/xml");
      return doc.documentElement.tagName === "urlset"
        ? [...doc.querySelectorAll("loc")].map((loc) => loc.textContent ?? "")
        : null;
    },
    await response.text(),
  );
  expect(locs, "the sitemap parses as a urlset").not.toBeNull();
  const list = locs ?? [];
  const paths = list.map((loc) => new URL(loc).pathname);
  const expected = [
    "/",
    ...topLevel,
    "/ui/",
    ...componentPages.map((entry) => `/ui/${entry.slug}/`),
  ];
  for (const path of expected) expect(paths, path).toContain(path);
  expect(new Set(list).size, "a URL is listed twice").toBe(list.length);
  for (const loc of list) {
    expect(new URL(loc).origin, loc).toBe(site.url);
    const listed = await request.get(new URL(loc).pathname);
    expect(listed.status(), loc).toBe(200);
  }
});

test("/robots.txt allows the site and points at the sitemap", async ({ request }) => {
  const response = await request.get("/robots.txt");
  expect(response.status()).toBe(200);
  expect(response.headers()["content-type"]).toContain("text/plain");
  const text = await response.text();
  expect(text).toContain("User-agent: *");
  expect(text).toContain("Allow: /");
  expect(text).toContain(`Sitemap: ${site.url}/sitemap.xml`);
});
