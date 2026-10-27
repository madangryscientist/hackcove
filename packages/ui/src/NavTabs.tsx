import type { ReactElement, ReactNode } from "react";
import { cx, focusRing } from "./cx.js";
import type { Passthrough } from "./props.js";
import type { Size } from "./size.js";
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

// A transparent border, so a tab is as tall as a `Button` of the same size.
const BASE = `rounded-lg border border-transparent transition ${focusRing}`;

/** A tab's padding and text, by `size`. */
const SIZE: Record<Size, string> = {
  sm: "px-2.5 py-1 text-xs",
  md: "px-3 py-2 text-sm",
  lg: "px-4 py-2.5 text-base",
};

/** The classes of one tab, for a router's own <Link>. A `disabled` one drops the hover fill. */
export function navTabClass(active: boolean, disabled = false, size: Size = "md"): string {
  return cx(
    BASE,
    SIZE[size],
    active ? "bg-slate-100 font-medium text-slate-900" : "text-slate-600",
    !active && !disabled && "hover:bg-slate-100",
  );
}

/**
 * A row of pill links where the active one is filled. Plain <a> by default; a tab's `render` draws a
 * router's Link. `orientation="vertical"` stacks the same links in one column at the rail's width,
 * for a `SidebarLayout` rail: the same pill, the same `aria-current`, one link per line. `size`
 * matches the height of a `Button` of the same size.
 */
export function NavTabs({
  items,
  label,
  orientation = "horizontal",
  size = "md",
  ...rest
}: {
  items: NavTab[];
  /** The accessible name of the nav landmark. */
  label: string;
  orientation?: "horizontal" | "vertical";
  /**
   * The tabs' height and text, on the scale of a `Button`.
   * @default md
   */
  size?: Size;
} & Passthrough): ReactElement {
  return (
    <nav
      {...rest}
      aria-label={label}
      className={orientation === "vertical" ? "flex flex-col gap-1" : "flex flex-wrap gap-1"}
    >
      {items.map((item, index) => (
        <Tab key={item.href ?? index} item={item} size={size} />
      ))}
    </nav>
  );
}

function Tab({ item, size }: { item: NavTab; size: Size }): ReactElement {
  return renderLink({
    ...dataAttributes(item),
    href: item.href,
    render: item.render,
    external: item.external,
    className: navTabClass(!!item.active, false, size),
    "aria-current": item.active ? "page" : undefined,
    children: item.label,
  });
}
