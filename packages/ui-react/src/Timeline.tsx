import { Children, type ReactElement, type ReactNode } from "react";
import type { Tone } from "./tone.js";
import { cx } from "./cx.js";
import type { Passthrough } from "./props.js";
import { EmptySlot } from "./emptySlot.js";
import {
  BoneLines,
  BusyLabel,
  busy,
  isEmptySlot,
  type LoadingProps,
  LoadingScope,
  useLoading,
} from "./skeleton.js";

// The marker's colour is the tone's text colour, which every theme already remaps, drawn as a
// solid dot; `neutral` is the ring.
const DOT: Record<Tone, string> = {
  neutral: "border-slate-300 bg-white",
  info: "border-current bg-current text-blue-700",
  positive: "border-current bg-current text-emerald-700",
  warn: "border-current bg-current text-amber-700",
  danger: "border-current bg-current text-red-700",
};

/**
 * A vertical list of events, newest or oldest first as the caller orders them. A named `<ol>` of
 * `TimelineItem`s on a rail; with no children it draws `empty` (an `EmptyState`, one muted line here)
 * instead of an empty list. While `loading` with no items it draws three items of bones, never
 * `empty`.
 */
export function Timeline({
  label,
  empty,
  loading,
  loadingLabel,
  children,
  ...rest
}: {
  /** Names the list (`aria-label`), e.g. "Status history". */
  label: string;
  /** Drawn in place of the list when there are no items: an `EmptyState`. */
  empty?: ReactNode;
  children?: ReactNode;
} & LoadingProps &
  Passthrough): ReactElement | null {
  const { loading: waiting, owner } = useLoading(loading);
  const none = Children.toArray(children).length === 0;
  if (none && !waiting) {
    return empty == null ? null : <EmptySlot size="sm">{empty}</EmptySlot>;
  }
  return (
    <ol {...rest} {...busy(owner, waiting)} aria-label={label} className="flex flex-col">
      <LoadingScope loading={waiting}>
        {none ? [0, 1, 2].map((i) => <TimelineItem key={i} title="" />) : children}
      </LoadingScope>
      {owner && waiting && (
        <li className="sr-only">
          <BusyLabel owner={owner} loading={waiting} label={loadingLabel} />
        </li>
      )}
    </ol>
  );
}

/**
 * One event: a `title` (a `Pill`, a heading), a `time` the app has already formatted, and the
 * `children` as a note under them. `tone` colours the marker dot with the Callout's set. While
 * `loading` an empty `title` is a bone.
 */
export function TimelineItem({
  title,
  time,
  tone = "neutral",
  loading,
  loadingLabel,
  children,
  ...rest
}: {
  /** What happened: text, a `Pill` or a heading. */
  title: ReactNode;
  /** When, already formatted by the app, small and muted beside the title. */
  time?: ReactNode;
  /** The marker dot's colour. Defaults to `neutral`, a plain ring. Say it in the text too: colour alone says nothing to a screen reader. */
  tone?: Tone;
  children?: ReactNode;
} & LoadingProps &
  Passthrough): ReactElement {
  const { loading: waiting, owner } = useLoading(loading);
  const bone = waiting && isEmptySlot(title);
  return (
    <li
      {...rest}
      {...busy(owner, waiting)}
      className="relative border-l border-slate-300 pb-5 pl-5 last:border-transparent last:pb-0"
    >
      <span
        aria-hidden="true"
        className={cx("absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full border-2", DOT[tone])}
      />
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <span className={cx("text-sm font-medium text-slate-900", bone && "w-1/3")}>
          {bone ? <BoneLines count={1} /> : title}
        </span>
        {time != null && <span className="text-xs tabular-nums text-slate-500">{time}</span>}
      </div>
      {children != null && <div className="mt-1 text-sm text-slate-700">{children}</div>}
      <BusyLabel owner={owner} loading={waiting} label={loadingLabel} />
    </li>
  );
}
