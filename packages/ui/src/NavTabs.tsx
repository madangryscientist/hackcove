import type { ReactElement, ReactNode } from "react";
import { cx, focusRing } from "./cx.js";
import { type LinkRender, renderLink } from "./link.js";

/**
 * One pill link in a NavTabs row: a plain `<a href>`, or with `render` the app's own router
 * `<Link>` (`render: (p) => <Link to="/stores" {...p} />`, which gets the tab's classes and
 * `aria-current`; `href` is then not used). `external` opens in a new tab.
 */
export type NavTab = {
  label: ReactNode;
  active?: boolean;
  external?: boolean;
} & ({ href: string; render?: LinkRender } | { href?: string; render: LinkRender });

const BASE = `rounded-lg px-3 py-1.5 transition ${focusRing}`;

/** The classes of one tab, for a router's own <Link>. */
export function navTabClass(active: boolean): string {
  return cx(
    BASE,
    active ? "bg-slate-100 font-medium text-slate-900" : "text-slate-600 hover:bg-slate-100",
  );
}

/** A row of pill links where the active one is filled. Plain <a> by default; a tab's `render` draws a router's Link. */
export function NavTabs({
  items,
  label,
  className,
}: {
  items: NavTab[];
  /** The accessible name of the nav landmark. */
  label: string;
  className?: string;
}): ReactElement {
  return (
    <nav aria-label={label} className={cx("flex flex-wrap gap-1 text-sm", className)}>
      {items.map((item, index) => (
        <Tab key={item.href ?? index} item={item} />
      ))}
    </nav>
  );
}

function Tab({ item }: { item: NavTab }): ReactElement {
  return renderLink({
    href: item.href,
    render: item.render,
    external: item.external,
    className: navTabClass(!!item.active),
    "aria-current": item.active ? "page" : undefined,
    children: item.label,
  });
}
