import type { ReactElement, ReactNode } from "react";
import { cx } from "./cx.js";
import type { Passthrough } from "./props.js";
import { Text } from "./typography.js";

/**
 * A bulleted `<ul>`: discs, indented, a small gap between items. `ordered` makes it a numbered
 * `<ol>` (steps a reader follows in order), with the same indent and gap. Its children are `BulletItem`s.
 */
export function BulletList({
  ordered = false,
  children,
  ...rest
}: {
  /** A numbered `<ol>` instead of the bulleted `<ul>`, for items whose order matters. */
  ordered?: boolean | undefined;
  children: ReactNode;
} & Passthrough): ReactElement {
  const Tag = ordered ? "ol" : "ul";
  return (
    <Tag {...rest} className={cx(ordered ? "list-decimal" : "list-disc", "space-y-1 pl-5")}>
      {children}
    </Tag>
  );
}

/**
 * One item of a `BulletList`: an `<li>` in the body text's size and ink (the long-form scale inside
 * a `Prose`). A long unbroken string (a URL, a token) breaks at the edge instead of overflowing.
 */
export function BulletItem({
  children,
  ...rest
}: { children: ReactNode } & Passthrough): ReactElement {
  return (
    <Text as="li" breakWords {...rest}>
      {children}
    </Text>
  );
}
