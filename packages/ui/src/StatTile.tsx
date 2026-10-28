import type { HTMLAttributes, ReactElement, ReactNode } from "react";
import type { Unstyled } from "./props.js";
import { cx } from "./cx.js";
import { BAR_FILL } from "./ProgressBar.js";

/** The colour of a tile's value (and of its accent bar): plain ink, green or red. */
export type StatTileTone = "neutral" | "positive" | "negative";

const VALUE: Record<StatTileTone, string> = {
  neutral: "text-slate-900",
  positive: "text-emerald-700",
  negative: "text-red-700",
};

const BAR: Record<StatTileTone, string> = {
  neutral: BAR_FILL.accent,
  positive: BAR_FILL.positive,
  negative: BAR_FILL.negative,
};

/**
 * One headline figure: an uppercase caption over a large tabular-nums value, with an optional
 * hint line beneath. `tone` colours the value; `accent` adds a bar across the top edge in the same
 * tone. Pass the value already formatted.
 */
export function StatTile({
  label,
  value,
  hint,
  tone = "neutral",
  accent = false,
  ...rest
}: {
  /** The small uppercase caption over the value. */
  label: ReactNode;
  /** The figure, already formatted, large and in tabular figures. */
  value: ReactNode;
  /** A muted line under the value. */
  hint?: ReactNode;
  /** Defaults to "neutral". */
  tone?: StatTileTone;
  /** A bar across the top edge in the tone's colour. */
  accent?: boolean;
} & Unstyled<Omit<HTMLAttributes<HTMLDivElement>, "children">>): ReactElement {
  return (
    <div
      {...rest}
      className="relative overflow-hidden rounded-xl border border-slate-200/70 bg-white p-5 shadow-sm"
    >
      {accent && (
        <span aria-hidden="true" className={cx("absolute inset-x-0 top-0 h-1", BAR[tone])} />
      )}
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</p>
      <p className={cx("mt-2 text-3xl font-bold tabular-nums", VALUE[tone])}>{value}</p>
      {hint != null && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}
