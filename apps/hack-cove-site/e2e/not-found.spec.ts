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

// A loc is XML text: `&` and `<` are escaped, so read it back before it is used as a URL.
const unescape = (text: string) =>
  text.replaceAll("&lt;", "<").replaceAll("&gt;", ">").replaceAll("&amp;", "&");

test("/ui/no-such-page/ is a 404 in the site frame, with the way home", async ({ page }) => {
  const response = await page.goto("/ui/no-such-page/");
  expect(response?.status()).toBe(404);
  await expect(page.getByRole("banner")).toBeVisible();
  await expect(page.getByRole("heading", { level: 1, name: "Page not found" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Back to home" })).toHaveAttribute("href", "/");
});

test("/sitemap.xml lists every page, and every page it lists is there", async ({ request }) => {
  const response = await request.get("/sitemap.xml");
  expect(response.status()).toBe(200);
  expect(response.headers()["content-type"]).toContain("xml");
  const xml = await response.text();
  expect(xml).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].flatMap((match) => match[1] ?? []);
  const paths = locs.map((loc) => new URL(unescape(loc)).pathname);
  const expected = ["/", ...topLevel, "/ui/", ...componentPages.map((page) => `/ui/${page.slug}/`)];
  for (const path of expected) expect(paths, path).toContain(path);
  expect(new Set(locs).size, "a URL is listed twice").toBe(locs.length);
  for (const loc of locs) {
    // A `&` in a URL must reach the sitemap as `&amp;`, or the document is not valid XML.
    expect(loc, "a loc is escaped XML text").not.toMatch(/&(?!(?:amp|lt|gt);)/);
    expect(new URL(unescape(loc)).origin, loc).toBe(site.url);
    const page = await request.get(new URL(unescape(loc)).pathname);
    expect(page.status(), loc).toBe(200);
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
