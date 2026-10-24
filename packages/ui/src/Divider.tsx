import type { HTMLAttributes, ReactElement } from "react";
import { cx } from "./cx.js";

/** A hairline rule in the theme's line colour: between a heading and its content, or above a footer. Spacing is the caller's, on `className`. */
export function Divider({
  className,
  ...rest
}: Omit<HTMLAttributes<HTMLHRElement>, "children">): ReactElement {
  return <hr className={cx("border-t border-slate-200/70", className)} {...rest} />;
}
