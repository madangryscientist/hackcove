import { Children, type ReactElement, type ReactNode } from "react";
import type { Passthrough } from "./props.js";
import { cx } from "./cx.js";
import { Caption } from "./typography.js";

/** The mark between MetaList items: `·`, `•`, or `none` for a gap alone. */
export type MetaListSeparator = "·" | "•" | "none";

/**
 * A wrapping row of facts or links in muted small text, joined by a `·`: branch · SHA · date, or a
 * footer's Privacy · Terms · Email. An item is text, a `Code` or a `TextLink`. The separator is
 * `aria-hidden` and leads each item but the first, held to its item so a wrap never leaves one at a
 * line's end; `separator` swaps it for a `•` or none. An item never breaks inside itself: the
 * row wraps between items. `mono` sets the whole row in the monospace face, for ids and paths.
 */
export function MetaList({
  mono = false,
  separator = "·",
  children,
  ...rest
}: {
  /** The whole row in the monospace face, for ids and paths. */
  mono?: boolean | undefined;
  /**
   * The mark between items: `·`, `•`, or `none` for a gap alone.
   * @default ·
   */
  separator?: MetaListSeparator | undefined;
  children: ReactNode;
} & Passthrough): ReactElement {
  return (
    <ul
      {...rest}
      className={cx(
        "flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-500",
        mono && "font-mono",
      )}
    >
      {Children.toArray(children).map((child, index) => (
        <li key={index} className="inline-flex items-center gap-x-3 whitespace-nowrap">
          {index > 0 && separator !== "none" && (
            <Caption as="span" aria-hidden="true">
              {separator}
            </Caption>
          )}
          {child}
        </li>
      ))}
    </ul>
  );
}
