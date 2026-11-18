import { existsSync, globSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, test } from "vitest";
import { componentPages } from "../src/content/components/index";
import { site } from "../src/content/site";
import { sitePages } from "./pages";

/*
 * The build's own files, read from `dist/` with no server and no browser: the `test` task depends on
 * `build`, so this is always a fresh build. The e2e server serves `dist/` as it is, so a file here is a
 * page served there; the live status of each URL is the post-deploy smoke's to check.
 */

const DIST = resolve(import.meta.dirname, "../dist");
if (!existsSync(resolve(DIST, "404.html")))
  throw new Error(
    `No built site in ${DIST}. Run the build first: bunx moon run hack-cove-site:build.`,
  );

const read = (path: string): string => {
  const file = resolve(DIST, path);
  if (!existsSync(file)) throw new Error(`${path} is not in the build`);
  return readFileSync(file, "utf8");
};

/** The built file a page path is served from: `/` is `index.html`, `/cv/` is `cv/index.html`. */
const fileOf = (path: string) => `${path.slice(1)}index.html`;

/** The page path a built HTML file is served at, or the file itself when it is not an `index.html`. */
const pathOf = (file: string) => {
  if (file === "index.html") return "/";
  if (file.endsWith("/index.html")) return `/${file.slice(0, -"index.html".length)}`;
  return file;
};

/** Text as it was before HTML or XML escaped it; the build escapes only these. */
const unescape = (text: string) =>
  text
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'")
    .replaceAll("&amp;", "&");

/** The URL a page is reached at on the live host. */
const urlOf = (path: string) => new URL(path, site.url).href;

describe("the one page list", () => {
  test("every built page is in sitePages, and every page in it was built", () => {
    const built = globSync("**/*.html", { cwd: DIST })
      .filter((file) => file !== "404.html")
      .map(pathOf);
    expect(built.toSorted()).toEqual([...sitePages].toSorted());
  });
});

describe("sitemap.xml and robots.txt", () => {
  test("the sitemap is a urlset that lists every page in sitePages once, on the live host, and nothing else", () => {
    const xml = read("sitemap.xml");
    expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>\n')).toBe(true);
    const body = xml.slice(xml.indexOf("\n") + 1).trim();
    // The whole body is one urlset of url/loc entries: anything else in it is a malformed sitemap.
    expect(body).toMatch(
      /^<urlset xmlns="http:\/\/www\.sitemaps\.org\/schemas\/sitemap\/0\.9">(\s*<url><loc>[^<]+<\/loc><\/url>)*\s*<\/urlset>$/,
    );
    const locs = [...body.matchAll(/<loc>([^<]+)<\/loc>/g)].map(([, loc = ""]) => unescape(loc));
    expect(locs).toEqual(sitePages.map(urlOf));
  });

  test("robots.txt allows the whole site and names the sitemap", () => {
    expect(read("robots.txt").split("\n")).toEqual(
      expect.arrayContaining(["User-agent: *", "Allow: /", `Sitemap: ${urlOf("/sitemap.xml")}`]),
    );
  });
});

describe("/ui/llms.txt", () => {
  test("it leads with what the library is and has one section per component page", () => {
    const text = read("ui/llms.txt");
    expect(text).toContain("fully integrated with its theming");
    const missing = componentPages.filter(({ name }) => !text.includes(`\n## ${name}\n`));
    expect(missing.map(({ slug }) => `/ui/${slug}/`)).toEqual([]);
  });
});

/** The values of one tag's attribute in a page's head, unescaped. */
const headValues = (head: string, tag: RegExp) =>
  [...head.matchAll(tag)].map(([, value = ""]) => unescape(value));

describe.each(sitePages)("%s, in its head", (path) => {
  const html = read(fileOf(path));
  const head = html.slice(0, html.indexOf("</head>"));

  test("one non-empty title and one meta description", () => {
    const titles = headValues(head, /<title>([^<]*)<\/title>/g);
    const descriptions = headValues(head, /<meta name="description" content="([^"]*)"/g);
    expect(titles).toHaveLength(1);
    expect(titles[0]?.trim()).not.toBe("");
    expect(descriptions).toHaveLength(1);
    expect(descriptions[0]?.trim()).not.toBe("");
  });

  test("one canonical, its own URL on the live host, and og:url the same", () => {
    expect(headValues(head, /<link rel="canonical" href="([^"]*)"/g)).toEqual([urlOf(path)]);
    expect(headValues(head, /<meta property="og:url" content="([^"]*)"/g)).toEqual([urlOf(path)]);
  });
});
