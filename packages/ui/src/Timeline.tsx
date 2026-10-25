import { Children, type ReactElement, type ReactNode } from "react";
import type { CalloutTone } from "./Callout.js";
import { cx } from "./cx.js";

// The marker's colour is the tone's text colour, which every theme already remaps, drawn as a
// solid dot; `neutral` is the ring.
const DOT: Record<CalloutTone, string> = {
  neutral: "border-slate-300 bg-white",
  info: "border-current bg-current text-blue-700",
  positive: "border-current bg-current text-emerald-700",
  warn: "border-current bg-current text-amber-700",
  danger: "border-current bg-current text-red-700",
};

/**
 * A vertical list of events, newest or oldest first as the caller orders them. A named `<ol>` of
 * `TimelineItem`s on a rail; with no children it draws `empty` instead of an empty list.
 */
export function Timeline({
  label,
  empty,
  children,
}: {
  /** Names the list (`aria-label`), e.g. "Status history". */
  label: string;
  /** Drawn in place of the list when there are no items. */
  empty?: ReactNode;
  children?: ReactNode;
}): ReactElement | null {
  if (Children.toArray(children).length === 0) {
    return empty == null ? null : <>{empty}</>;
  }
  return (
    <ol aria-label={label} className="flex flex-col">
      {children}
    </ol>
  );
}

/**
 * One event: a `title` (a `Pill`, a heading), a `time` the app has already formatted, and the
 * `children` as a note under them. `tone` colours the marker dot with the Callout's set.
 */
export function TimelineItem({
  title,
  time,
  tone = "neutral",
  children,
}: {
  title: ReactNode;
  time?: ReactNode;
  /** The marker dot's colour. Defaults to `neutral`, a plain ring. */
  tone?: CalloutTone;
  children?: ReactNode;
}): ReactElement {
  return (
    <li className="relative border-l border-slate-300 pb-5 pl-5 last:border-transparent last:pb-0">
      <span
        aria-hidden="true"
        className={cx("absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full border-2", DOT[tone])}
      />
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <span className="text-sm font-medium text-slate-900">{title}</span>
        {time != null && <span className="text-xs tabular-nums text-slate-500">{time}</span>}
      </div>
      {children != null && <div className="mt-1 text-sm text-slate-700">{children}</div>}
    </li>
  );
}
