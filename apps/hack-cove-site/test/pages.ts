import { readdirSync } from "node:fs";
import { componentPages } from "../../../packages/ui-react/docs/components/index";

/**
 * Every page the site builds, as its URL path: the one list every test that means "every page" reads.
 * It is derived the way `src/pages/sitemap.xml.ts` derives its list, so a new page joins every check
 * with no list to edit: the top-level pages from `src/pages/*.astro` (`index` is `/`, and `404` is
 * served with status 404, so it is no page here), then `/ui/` and one `/ui/<slug>/` per docs page.
 * `built.test.ts` holds this list to `dist/` and to the sitemap, so the two never drift.
 */
const topLevel = readdirSync(new URL("../src/pages", import.meta.url))
  .filter((name) => name.endsWith(".astro"))
  .map((name) => name.slice(0, -".astro".length))
  .filter((name) => name !== "index" && name !== "404")
  .toSorted()
  .map((name) => `/${name}/`);

export const sitePages: readonly string[] = [
  "/",
  ...topLevel,
  "/ui/",
  ...componentPages.map(({ slug }) => `/ui/${slug}/`),
];
