import type { ReactElement, ReactNode } from "react";
import type { Passthrough } from "./props.js";

/**
 * A full-width row that sticks under AppShell's header as the page scrolls: a filter or actions
 * bar, or a viewer's title and its actions. It sits on the surface with a bottom line and pads its
 * content as the Container pads a page. Put a `Cluster` in it for the row's layout. It spans its
 * parent, so it belongs at the top of an `AppShell bleed` page; `FullBleedLayout`'s `bar` is one.
 */
export function StickyBar({
  children,
  ...rest
}: Passthrough & {
  /** The bar's content, usually one `Cluster` (`justify="between"` for a title and its actions). */
  children: ReactNode;
}): ReactElement {
  return (
    <div
      {...rest}
      className="sticky top-[var(--app-header,0px)] z-5 border-b border-slate-200 bg-white px-4 py-2 sm:px-6"
    >
      {children}
    </div>
  );
}
