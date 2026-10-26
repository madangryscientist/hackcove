import type { ReactElement, ReactNode } from "react";
import type { Passthrough } from "./props.js";

/**
 * A numbered list of things to do, in order: a `title` and, under it, a line of `children`. The
 * numbers are counted by CSS, so `Step`s can sit in a fragment or behind a condition and still run
 * 1, 2, 3. For the way into a product ("install, log in, run"), not for progress: nothing here is
 * done or current. A wizard's progress indicator is a different part (HC-108, `Stepper`).
 */
export function Steps({ children, ...rest }: { children?: ReactNode } & Passthrough): ReactElement {
  return (
    <ol
      role="list"
      {...rest}
      className="flex list-none flex-col gap-3 text-left [counter-reset:step]"
    >
      {children}
    </ol>
  );
}

/** One step of `Steps`: a `title` in medium weight and the `children` as the detail under it. */
export function Step({
  title,
  children,
  ...rest
}: { title: ReactNode; children?: ReactNode } & Passthrough): ReactElement {
  return (
    <li {...rest} className="grid grid-cols-[1.625rem_1fr] gap-3 [counter-increment:step]">
      <span
        aria-hidden="true"
        className="flex size-[1.625rem] items-center justify-center rounded-full bg-violet-50 text-xs font-semibold tabular-nums text-violet-600 before:content-[counter(step)]"
      />
      <div className="min-w-0 pt-0.5">
        <div className="text-sm/5 font-medium text-slate-900">{title}</div>
        {children != null && <div className="mt-1 text-sm/5 text-slate-600">{children}</div>}
      </div>
    </li>
  );
}
