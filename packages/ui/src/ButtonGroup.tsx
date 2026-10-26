import type { HTMLAttributes, ReactElement, ReactNode } from "react";
import type { Unstyled } from "./props.js";

/**
 * A wrapping row of buttons with one optional item pushed to the far end (a Back link, say). On a
 * narrow viewport the row wraps and `end` stays at the end of the last line. `label` makes it a
 * named `role="group"`. Directly in a `Card` footer it spans the footer, so `end` reaches the far
 * edge.
 */
export function ButtonGroup({
  children,
  end,
  label,
  ...rest
}: {
  children: ReactNode;
  /** One item, pushed to the end of the row. */
  end?: ReactNode;
  /** The accessible name of the group: sets `role="group"` and `aria-label`. */
  label?: string;
} & Unstyled<Omit<HTMLAttributes<HTMLDivElement>, "children">>): ReactElement {
  return (
    <div
      {...rest}
      {...(label === undefined ? {} : { role: "group", "aria-label": label })}
      data-button-group=""
      className="flex flex-wrap items-center gap-2"
    >
      {children}
      {end ? <div className="ml-auto">{end}</div> : null}
    </div>
  );
}
