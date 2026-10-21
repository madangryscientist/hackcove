import type { ReactElement, ReactNode } from "react";
import { cx, focusRing } from "./cx.js";

/** One pill link in a NavTabs row. */
export type NavTab = { label: ReactNode; href: string; active?: boolean };

const BASE = `rounded-lg px-3 py-1.5 transition ${focusRing}`;

/** The classes of one tab, for a router's own <Link>. */
export function navTabClass(active: boolean): string {
  return cx(
    BASE,
    active ? "bg-slate-100 font-medium text-slate-900" : "text-slate-600 hover:bg-slate-100",
  );
}

/** A row of pill links where the active one is filled. Renders plain <a>; use navTabClass with a router's Link. */
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
      {items.map((item) => (
        <a
          key={item.href}
          href={item.href}
          className={navTabClass(!!item.active)}
          aria-current={item.active ? "page" : undefined}
        >
          {item.label}
        </a>
      ))}
    </nav>
  );
}
