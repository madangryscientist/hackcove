import { Tabs } from "@hackcove/ui";
import { type Section, site } from "../content/site";

const plain = (path: string) => (path.length > 1 ? path.replace(/\/+$/, "") : path);

/** The section a path belongs to: its own page and the pages under it, or one of its `alsoPaths`. `/privacy` and `/` belong to none. */
function sectionFor(pathname: string): Section | undefined {
  const here = plain(pathname);
  return site.sections.find((section) =>
    [section.href, ...(section.alsoPaths ?? [])].some(
      (path) => plain(path) === here || here.startsWith(`${plain(path)}/`),
    ),
  );
}

/** The header nav: one tab per section, the current one marked with `aria-current`. */
export function SiteNav({ pathname }: { pathname: string }) {
  const current = sectionFor(pathname);
  const items = site.sections.map((section) => ({
    label: section.navLabel,
    href: section.href,
    active: section === current,
  }));
  return <Tabs variant="pill" items={items} label="Sections" />;
}
