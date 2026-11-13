import { componentPages } from "../content/components";
import { site } from "../content/site";

/* Every page the site has, for crawlers: the top-level pages are read from `src/pages/*.astro`, so a
   new page is listed without editing a second place. `404.astro` is left out (it is built to
   `404.html` and served with status 404), and the component pages come from the docs' own list. */

const topLevel = Object.keys(import.meta.glob("./*.astro"))
  .map((path) => path.slice("./".length, -".astro".length))
  .filter((name) => name !== "index" && name !== "404")
  .toSorted()
  .map((name) => `/${name}/`);

const paths = ["/", ...topLevel, "/ui/", ...componentPages.map((page) => `/ui/${page.slug}/`)];

/** XML text: a URL carrying `&` or `<` would otherwise make the document invalid. A loc is element text, so only these three are needed. */
const xmlText = (text: string) =>
  text.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");

export function GET() {
  const urls = paths
    .map((path) => `  <url><loc>${xmlText(new URL(path, site.url).href)}</loc></url>`)
    .join("\n");
  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    urls,
    "</urlset>",
    "",
  ].join("\n");
  return new Response(xml, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}
