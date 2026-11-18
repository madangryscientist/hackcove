import { expect, test } from "@playwright/test";
import { site } from "../src/content/site";

// Post-deploy smoke checks against the live host (SMOKE_BASE_URL). Requests only, no page is opened.
// These are what only a real host shows: the content types the host sends, redirects it answers with,
// and whether an unknown path gets the 404 page or the homepage again (a direct-upload host with no
// 404.html serves index.html with a 200 for any path it cannot find).
//
// The sitemap names pages by the public site URL (`site.url`). The checks read each listed path from
// SMOKE_BASE_URL, so the same suite runs against a local `dist` server.

const sitemapUrl = new URL("/sitemap.xml", site.url).href;

test("an unknown path answers 404 with the site's 404 page", async ({ request }) => {
  const response = await request.get("/smoke-no-such-page/", { maxRedirects: 0 });
  expect(response.status()).toBe(404);
  const title = `Page not found | ${site.name}`;
  expect(await response.text()).toContain(`<title>${title}</title>`);
});

test("/robots.txt is plain text and names the sitemap", async ({ request }) => {
  const response = await request.get("/robots.txt", { maxRedirects: 0 });
  expect(response.status()).toBe(200);
  expect(response.headers()["content-type"]).toContain("text/plain");
  expect(await response.text()).toContain(`Sitemap: ${sitemapUrl}`);
});

test("/sitemap.xml is XML, not the homepage HTML", async ({ request }) => {
  const response = await request.get("/sitemap.xml", { maxRedirects: 0 });
  expect(response.status()).toBe(200);
  expect(response.headers()["content-type"]).toContain("xml");
  expect(await response.text()).toContain("<urlset");
});

// Runs `task` over `items` with at most `limit` in flight, keeping the results in input order. The live
// host answers in about 300 ms, so one page at a time would take longer than Playwright's test timeout.
async function mapConcurrent<T, R>(
  items: readonly T[],
  limit: number,
  task: (item: T) => Promise<R>,
): Promise<R[]> {
  const queue = items.map((item, index) => ({ item, index }));
  const results: R[] = [];
  const worker = async (): Promise<void> => {
    for (let entry = queue.shift(); entry !== undefined; entry = queue.shift()) {
      results[entry.index] = await task(entry.item);
    }
  };
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}

test("every sitemap loc answers 200 with no redirect, and its canonical is that loc", async ({
  request,
}) => {
  const sitemap = await (await request.get("/sitemap.xml", { maxRedirects: 0 })).text();
  const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1] ?? "");
  expect(locs.length, "the sitemap lists pages").toBeGreaterThan(0);
  const pages = await mapConcurrent(locs, 8, async (loc) => {
    const response = await request.get(new URL(loc).pathname, { maxRedirects: 0 });
    const tags = [...(await response.text()).matchAll(/<link\b[^>]*>/g)].map((match) => match[0]);
    const canonical = tags.find((tag) => /\brel="canonical"/.test(tag));
    return { loc, status: response.status(), href: canonical?.match(/\bhref="([^"]*)"/)?.[1] };
  });
  // Assert per loc, after every fetch, so a failure names the loc that broke.
  for (const page of pages) {
    expect(page.status, page.loc).toBe(200);
    expect(page.href, `${page.loc} has a canonical link`).toBeDefined();
    expect(page.href, page.loc).toBe(page.loc);
  }
});
