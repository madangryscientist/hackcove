import { Tabs } from "@hackcove/ui-react";
import { type NavTab, site } from "../content/site";

const plain = (path: string) => (path.length > 1 ? path.replace(/\/+$/, "") : path);

/** The tab a path belongs to: its own page and the pages under it. `/privacy` and `/` belong to none. */
function tabFor(pathname: string): NavTab | undefined {
  const here = plain(pathname);
  return site.nav.find((tab) => {
    const path = plain(tab.href);
    return path === here || here.startsWith(`${path}/`);
  });
}

/** The header nav: one tab per section and one for the CV, the current one marked with `aria-current`. */
export function SiteNav({ pathname }: { pathname: string }) {
  const current = tabFor(pathname);
  const items = site.nav.map((tab) => ({
    label: tab.navLabel,
    href: tab.href,
    selected: tab === current,
  }));
  return <Tabs items={items} label="Sections" />;
}
