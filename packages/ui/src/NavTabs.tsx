import type { ReactElement, ReactNode } from "react";
import { cx, focusRing } from "./cx.js";
import type { Passthrough } from "./props.js";
import { type DataAttributes, dataAttributes, type LinkRender, renderLink } from "./link.js";

/**
 * One pill link in a NavTabs row: a plain `<a href>`, or with `render` the app's own router
 * `<Link>` (`render: (p) => <Link to="/stores" {...p} />`, which gets the tab's classes and
 * `aria-current`; `href` is then not used). `external` opens in a new tab. A `data-*` key
 * (`"data-testid": "tab-quotes"`) goes on the link.
 */
export type NavTab = DataAttributes & {
  label: ReactNode;
  active?: boolean;
  external?: boolean;
} & ({ href: string; render?: LinkRender } | { href?: string; render: LinkRender });

const BASE = `rounded-lg px-3 py-1.5 transition ${focusRing}`;

/** The classes of one tab, for a router's own <Link>. A `disabled` one drops the hover fill. */
export function navTabClass(active: boolean, disabled = false): string {
  return cx(
    BASE,
    active ? "bg-slate-100 font-medium text-slate-900" : "text-slate-600",
    !active && !disabled && "hover:bg-slate-100",
  );
}

/**
 * A row of pill links where the active one is filled. Plain <a> by default; a tab's `render` draws a
 * router's Link. `orientation="vertical"` stacks the same links in one column at the rail's width,
 * for a `SidebarLayout` rail: the same pill, the same `aria-current`, one link per line.
 */
export function NavTabs({
  items,
  label,
  orientation = "horizontal",
  ...rest
}: {
  items: NavTab[];
  /** The accessible name of the nav landmark. */
  label: string;
  orientation?: "horizontal" | "vertical";
} & Passthrough): ReactElement {
  return (
    <nav
      {...rest}
      aria-label={label}
      className={
        orientation === "vertical" ? "flex flex-col gap-1 text-sm" : "flex flex-wrap gap-1 text-sm"
      }
    >
      {items.map((item, index) => (
        <Tab key={item.href ?? index} item={item} />
      ))}
    </nav>
  );
}

function Tab({ item }: { item: NavTab }): ReactElement {
  return renderLink({
    ...dataAttributes(item),
    href: item.href,
    render: item.render,
    external: item.external,
    className: navTabClass(!!item.active),
    "aria-current": item.active ? "page" : undefined,
    children: item.label,
  });
}
