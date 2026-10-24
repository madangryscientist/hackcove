import type { HTMLAttributes, ReactElement } from "react";
import { cx } from "./cx.js";

/** Inline code: mono, on a subtle inset background. It takes the surrounding text colour and size (a touch smaller, for the mono face). */
export function Code({ className, ...rest }: HTMLAttributes<HTMLElement>): ReactElement {
  return (
    <code
      className={cx("rounded bg-slate-100 px-1 py-0.5 font-mono text-[0.9em]", className)}
      {...rest}
    />
  );
}
