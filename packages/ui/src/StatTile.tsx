import type { HTMLAttributes, ReactElement, ReactNode } from "react";
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
  className,
  ...rest
}: {
  label: ReactNode;
  value: ReactNode;
  hint?: ReactNode;
  /** Defaults to "neutral". */
  tone?: StatTileTone;
  accent?: boolean;
} & Omit<HTMLAttributes<HTMLDivElement>, "children">): ReactElement {
  return (
    <div
      className={cx(
        "relative overflow-hidden rounded-xl border border-slate-200/70 bg-white p-5 shadow-sm",
        className,
      )}
      {...rest}
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
