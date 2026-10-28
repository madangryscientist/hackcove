import { Children, type ReactElement, type ReactNode } from "react";
import type { Passthrough } from "./props.js";
import { Caption } from "./typography.js";

export type InlineLinksSeparator = "·" | "•" | "none";

/**
 * A wrapping row of links, small text, joined by a separator. The separator is `aria-hidden` and
 * leads each link but the first, held to its link so a wrap never leaves one at a line's end.
 */
export function InlineLinks({
  separator = "·",
  children,
  ...rest
}: {
  /**
   * The mark between links: `·`, `•`, or `none` for a gap alone.
   * @default ·
   */
  separator?: InlineLinksSeparator;
  children: ReactNode;
} & Passthrough): ReactElement {
  return (
    <div {...rest} className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
      {Children.toArray(children).map((child, index) => (
        <span key={index} className="inline-flex items-center gap-x-3 whitespace-nowrap">
          {index > 0 && separator !== "none" && <Caption aria-hidden="true">{separator}</Caption>}
          {child}
        </span>
      ))}
    </div>
  );
}
