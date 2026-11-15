import type { ReactElement, ReactNode } from "react";
import type { Passthrough } from "./props.js";
import { Text } from "./typography.js";

/** A bulleted `<ul>`: discs, indented, a small gap between items. Its children are `BulletItem`s. */
export function BulletList({
  children,
  ...rest
}: { children: ReactNode } & Passthrough): ReactElement {
  return (
    <ul {...rest} className="list-disc space-y-1 pl-5">
      {children}
    </ul>
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
