import type { ReactElement, ReactNode } from "react";

/**
 * A wrapping row of buttons with one optional item pushed to the far end (a Back link, say). On a
 * narrow viewport the row wraps and `end` stays at the end of the last line. `label` makes it a
 * named `role="group"`.
 */
export function ButtonGroup({
  children,
  end,
  label,
}: {
  children: ReactNode;
  /** One item, pushed to the end of the row. */
  end?: ReactNode;
  /** The accessible name of the group: sets `role="group"` and `aria-label`. */
  label?: string;
}): ReactElement {
  return (
    <div
      {...(label === undefined ? {} : { role: "group", "aria-label": label })}
      className="flex flex-wrap items-center gap-2"
    >
      {children}
      {end ? <div className="ml-auto">{end}</div> : null}
    </div>
  );
}
