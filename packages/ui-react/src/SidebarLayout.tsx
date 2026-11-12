import { type ReactElement, type ReactNode, useEffect, useRef, useState } from "react";
import { cx } from "./cx.js";
import { FoldedColumn } from "./foldedColumn.js";
import type { Passthrough } from "./props.js";
import { useScrollEdges } from "./scrollEdges.js";
import { scrollStopProps, useScrollStop } from "./scrollStop.js";
import {
  STICKY_ASIDE_MD,
  STICKY_BAR_MD,
  STICKY_FADE_MD,
  STICKY_INK_MD,
  STICKY_SCROLL_MD,
} from "./stickyColumn.js";

/** The rail's current link: the one `Tabs` marks with `aria-current`. */
const CURRENT = '[aria-current]:not([aria-current="false"])';

/** The room the scroller's fade takes at each edge (`STICKY_FADE_MD`'s 1.5rem), in px. */
const FADE = 24;

/**
 * Scrolls `scroller` (only it, never the page, which `scrollIntoView` would also move) so `item`
 * sits in the middle of its visible part. Left alone when it is already clear of the faded edges, or
 * when the scroller does not scroll (below `md`, or a rail that fits).
 */
function scrollToCentre(scroller: HTMLElement, item: HTMLElement): void {
  if (scroller.scrollHeight <= scroller.clientHeight) return;
  const box = scroller.getBoundingClientRect();
  const at = item.getBoundingClientRect();
  if (at.top >= box.top + FADE && at.bottom <= box.bottom - FADE) return;
  scroller.scrollTop += at.top + at.height / 2 - (box.top + box.height / 2);
}

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
 * border or a fixed height, and it no longer sits beside the canvas on a phone. Once the page has
 * loaded, a rail that scrolls shows its current link (the one with `aria-current`) in view, and the
 * folded disclosure reads `railLabel` and the current link's name ("All components: Button"); both
 * need the layout to hydrate.
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
  const { element, attach, stop } = useScrollStop();
  useScrollEdges(element, "y");
  const [current, setCurrent] = useState<string | undefined>(undefined);
  const scrolledTo = useRef<Element | null>(null);

  // The current link is scrolled into view once, and its name goes on the folded disclosure. It is
  // read when the layout mounts and again whenever the rail's links change (a consumer's router
  // moving `aria-current` to another link).
  useEffect(() => {
    if (!element) return undefined;
    const sync = () => {
      const item = element.querySelector<HTMLElement>(CURRENT);
      setCurrent(item?.textContent?.trim() || undefined);
      if (item && item !== scrolledTo.current) scrollToCentre(element, item);
      scrolledTo.current = item;
    };
    queueMicrotask(sync);
    const change = new MutationObserver(sync);
    change.observe(element, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: ["aria-current"],
    });
    return () => change.disconnect();
  }, [element]);
  const { props, ring } = scrollStopProps(stop, { label: railLabel });
  return (
    <div {...rest} className="flex flex-col gap-8 md:flex-row md:gap-10">
      <aside className={cx("w-full shrink-0 md:w-56", STICKY_ASIDE_MD)} aria-label={railLabel}>
        <div
          ref={attach}
          {...props}
          className={cx(STICKY_SCROLL_MD, STICKY_BAR_MD, STICKY_FADE_MD, ring)}
        >
          <div className={STICKY_INK_MD}>
            {railLabel === undefined ? (
              rail
            ) : (
              <FoldedColumn
                from="md"
                label={current === undefined ? railLabel : `${railLabel}: ${current}`}
              >
                {rail}
              </FoldedColumn>
            )}
          </div>
        </div>
      </aside>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
