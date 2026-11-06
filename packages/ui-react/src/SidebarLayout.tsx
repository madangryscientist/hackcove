import type { ReactElement, ReactNode } from "react";
import { cx } from "./cx.js";
import { FoldedColumn } from "./foldedColumn.js";
import type { Passthrough } from "./props.js";
import { scrollStopProps, useScrollStop } from "./scrollStop.js";
import { STICKY_ASIDE_MD, STICKY_SCROLL_MD } from "./stickyColumn.js";

/**
 * A `rail` of links beside the `children` canvas, in the Container the shell already gives every
 * page (a plain `<AppShell>`, no `bleed`): the rail starts at the header logo's x and the canvas
 * ends at the header's right edge. The rail has no background and no border, so it is a list of
 * links on the page; a `Tabs variant="pill" orientation="vertical"` is its content. From `md` it is `w-56` with
 * the canvas filling the rest, and it stays in view under the shell's header as a long page scrolls;
 * a rail taller than the screen scrolls itself, so its last link is reachable. Below `md` it stacks
 * above the canvas and nothing sticks. A long rail sets `railLabel`:
 * below `md` it then folds behind a disclosure of that name, closed, so the page comes first on a
 * phone, and from `md` it is the same rail; `railLabel` also names the rail's `<aside>` landmark. Upgrading from 0.2: the rail no longer has a fill, a
 * border or a fixed height, and it no longer sits beside the canvas on a phone.
 */
export function SidebarLayout({
  rail,
  railLabel,
  children,
  ...rest
}: {
  /** The links beside the canvas, usually a `Tabs variant="pill" orientation="vertical"`. */
  rail: ReactNode;
  /**
   * Folds the rail behind a disclosure with this name below `md` (a long rail), and names the rail's
   * `<aside>` landmark. Left out, the rail is always open and the aside is unnamed.
   */
  railLabel?: string | undefined;
  children: ReactNode;
} & Passthrough): ReactElement {
  const { attach, stop } = useScrollStop();
  const { props, ring } = scrollStopProps(stop, { label: railLabel });
  return (
    <div {...rest} className="flex flex-col gap-8 md:flex-row md:gap-10">
      <aside className={cx("w-full shrink-0 md:w-56", STICKY_ASIDE_MD)} aria-label={railLabel}>
        <div ref={attach} {...props} className={cx(STICKY_SCROLL_MD, ring)}>
          {railLabel === undefined ? (
            rail
          ) : (
            <FoldedColumn from="md" label={railLabel}>
              {rail}
            </FoldedColumn>
          )}
        </div>
      </aside>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
