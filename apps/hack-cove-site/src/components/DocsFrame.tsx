import { NavTabs, SidebarLayout, type NavTab } from "@hackcove/ui";
import type { ReactNode } from "react";
import { componentPages } from "../content/components";

const plain = (path: string) => (path.length > 1 ? path.replace(/\/+$/, "") : path);

/** The /ui/ pages' frame: the component list in the rail, the page in the canvas. */
export function DocsFrame({ pathname, children }: { pathname: string; children: ReactNode }) {
  const here = plain(pathname);
  const items: NavTab[] = [
    { label: "Getting started", href: "/ui/", active: here === "/ui" },
    ...componentPages.map((page) => ({
      label: page.name,
      href: `/ui/${page.slug}/`,
      active: here === `/ui/${page.slug}`,
    })),
  ];
  return (
    <SidebarLayout rail={<NavTabs label="Components" items={items} />}>{children}</SidebarLayout>
  );
}
