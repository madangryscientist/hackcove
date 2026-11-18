import { type APIRequestContext, expect, test } from "@playwright/test";
import { BUILD_COMMIT_PATTERN } from "../src/content/build-commit";
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

const EXPECT_COMMIT = process.env["SMOKE_EXPECT_COMMIT"];
/** How long an edge may keep serving the previous page after the upload before the check fails. */
const COMMIT_WAIT_MS = 120_000;

const buildCommitOf = (html: string): string | undefined =>
  /<meta name="build-commit" content="([^"]*)"/.exec(html)?.[1];

// With SMOKE_EXPECT_COMMIT set (the commit just deployed), the home page must name it; unset, the check
// prints the commit it finds. `curl -s https://hack-cove.com/ | grep build-commit` reads the same meta.
type CommitRead = { status: number; seen: string | undefined };

// One read of the home page. A fresh query each time, so no cache answers with an older copy of the page.
async function readCommit(request: APIRequestContext): Promise<CommitRead> {
  const response = await request.get(`/?commit-check=${crypto.randomUUID()}`, { timeout: 15_000 });
  const seen = response.ok() ? buildCommitOf(await response.text()) : undefined;
  return { status: response.status(), seen };
}

// Reads until the home page names `expected` or the wait runs out. An error answer or a dropped
// connection while the edge switches over counts as not yet, like an older sha.
async function waitForCommit(request: APIRequestContext, expected: string): Promise<CommitRead> {
  const deadline = Date.now() + COMMIT_WAIT_MS;
  for (;;) {
    const read = await readCommit(request).catch((error: unknown) => {
      if (Date.now() >= deadline) throw error;
      return { status: 0, seen: undefined };
    });
    if (read.seen === expected || Date.now() >= deadline) return read;
    // time-dependent: a live edge serves the previous deploy for a while after the upload; retry until it switches.
    await new Promise((done) => setTimeout(done, 5_000));
  }
}

test("the home page names the commit it was built from", async ({ request }) => {
  test.setTimeout(COMMIT_WAIT_MS + 30_000);
  if (EXPECT_COMMIT)
    expect(EXPECT_COMMIT, "SMOKE_EXPECT_COMMIT is a full sha").toMatch(BUILD_COMMIT_PATTERN);
  const { status, seen } = EXPECT_COMMIT
    ? await waitForCommit(request, EXPECT_COMMIT)
    : await readCommit(request);
  process.stdout.write(`build-commit on the home page: ${seen ?? "(none)"} (HTTP ${status})\n`);
  expect(status).toBe(200);
  expect(seen, "the home page has no build-commit meta").toBeDefined();
  expect(seen).toMatch(BUILD_COMMIT_PATTERN);
  if (EXPECT_COMMIT)
    expect(seen, `the live home page names ${seen}, not the deployed ${EXPECT_COMMIT}`).toBe(
      EXPECT_COMMIT,
    );
});
