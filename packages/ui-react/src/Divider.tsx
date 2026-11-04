import type { HTMLAttributes, ReactElement } from "react";
import type { Unstyled } from "./props.js";

/** A hairline rule in the theme's line colour: between a heading and its content, or above a footer. Space around it is the layout's. */
export function Divider(
  props: Unstyled<Omit<HTMLAttributes<HTMLHRElement>, "children">>,
): ReactElement {
  return <hr {...props} className="border-t border-slate-200/70" />;
}
