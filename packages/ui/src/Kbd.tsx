import type { HTMLAttributes, ReactElement, ReactNode } from "react";
import { cx } from "./cx.js";

/** A keyboard key. Its border takes the surrounding text colour, so it reads on a filled button and on plain text. */
export function Kbd({
  children,
  className,
  ...rest
}: {
  children: ReactNode;
} & HTMLAttributes<HTMLElement>): ReactElement {
  return (
    <kbd
      className={cx("rounded border border-current/30 px-1 font-mono text-xs leading-4", className)}
      {...rest}
    >
      {children}
    </kbd>
  );
}
