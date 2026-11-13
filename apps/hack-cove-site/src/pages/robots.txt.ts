import { site } from "../content/site";

/** Everything is public: hack-cove.com has no private paths, only the sitemap to point crawlers at. */
export function GET() {
  const sitemap = new URL("/sitemap.xml", site.url).href;
  const text = ["User-agent: *", "Allow: /", `Sitemap: ${sitemap}`, ""].join("\n");
  return new Response(text, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
