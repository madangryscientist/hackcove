import { createContext, type ReactElement, type ReactNode, useContext } from "react";
import type { Passthrough } from "./props.js";
import type { Size } from "./size.js";

/** A `Steps` scale: `md` the small list down a column, `lg` the steps across a landing page. */
export type StepsSize = Extract<Size, "md" | "lg">;

/** The size a `Step` reads from its `Steps`. Internal. */
const StepsSizeContext = createContext<StepsSize>("md");

// Each scale's classes are written out whole, so Tailwind sees them.
const LIST: Record<StepsSize, string> = {
  md: "flex list-none flex-col gap-3 text-left [counter-reset:step]",
  lg: "grid list-none grid-cols-1 gap-8 text-left [counter-reset:step] md:auto-cols-fr md:grid-flow-col md:gap-6",
};

const ITEM: Record<
  StepsSize,
  { item: string; number: string; body: string; title: string; detail: string }
> = {
  md: {
    item: "grid grid-cols-[1.625rem_1fr] gap-3 [counter-increment:step]",
    number:
      "flex size-[1.625rem] items-center justify-center rounded-full bg-violet-50 text-xs font-semibold tabular-nums text-violet-600 before:content-[counter(step)]",
    body: "min-w-0 pt-0.5",
    title: "text-sm/5 font-medium text-slate-900",
    detail: "mt-1 text-sm/5 text-slate-600",
  },
  lg: {
    item: "flex flex-col gap-4 [counter-increment:step]",
    number:
      "flex size-10 items-center justify-center rounded-full bg-violet-50 text-lg font-semibold tabular-nums text-violet-600 before:content-[counter(step)]",
    body: "min-w-0",
    title: "text-lg/7 font-semibold text-slate-900",
    detail: "mt-2 text-base/7 text-slate-600",
  },
};

/**
 * A numbered list of things to do, in order: a `title` and, under it, a line of `children`. The
 * numbers are counted by CSS, so `Step`s can sit in a fragment or behind a condition and still run
 * 1, 2, 3. For the way into a product ("install, log in, run"), not for progress: nothing here is
 * done or current. A wizard's progress indicator is a different part.
 *
 * `size="lg"` is the steps across a landing page: from `md` they sit side by side in equal columns,
 * each number at feature size over a large title; below `md` they stack. Use it for two to four
 * steps.
 */
export function Steps({
  size = "md",
  children,
  ...rest
}: {
  /**
   * `md` a small list down a column; `lg` the steps across a landing page from `md` (two to four).
   * @default md
   */
  size?: StepsSize | undefined;
  children?: ReactNode;
} & Passthrough): ReactElement {
  return (
    <StepsSizeContext.Provider value={size}>
      <ol role="list" {...rest} className={LIST[size]}>
        {children}
      </ol>
    </StepsSizeContext.Provider>
  );
}

/** One step of `Steps`: a `title` and the `children` as the detail under it, at its `Steps`' size. */
export function Step({
  title,
  children,
  ...rest
}: {
  /** What to do; `children` is the detail under it. */
  title: ReactNode;
  children?: ReactNode;
} & Passthrough): ReactElement {
  const scale = ITEM[useContext(StepsSizeContext)];
  return (
    <li {...rest} className={scale.item}>
      <span aria-hidden="true" className={scale.number} />
      <div className={scale.body}>
        <div className={scale.title}>{title}</div>
        {children != null && <div className={scale.detail}>{children}</div>}
      </div>
    </li>
  );
}
