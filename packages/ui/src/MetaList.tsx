import { Children, type ReactElement, type ReactNode } from "react";
import type { Passthrough } from "./props.js";
import { cx } from "./cx.js";
import { Caption } from "./typography.js";

/**
 * A wrapping row of facts in muted small text, joined by a `·`: branch · SHA · date. An item is
 * text, a `Code` or a `TextLink`. The separator is `aria-hidden` and leads each item but the first,
 * held to its item so a wrap never leaves one at a line's end. `mono` sets the whole row in the
 * monospace face, for ids and paths.
 */
export function MetaList({
  mono = false,
  children,
  ...rest
}: {
  mono?: boolean | undefined;
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
        <li key={index} className="inline-flex items-center gap-x-3">
          {index > 0 && <Caption aria-hidden="true">·</Caption>}
          {child}
        </li>
      ))}
    </ul>
  );
}
