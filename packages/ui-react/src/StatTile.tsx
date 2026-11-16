import type { ReactElement, ReactNode } from "react";
import type { Passthrough } from "./props.js";
import { cx } from "./cx.js";
import { BAR_FILL } from "./ProgressBar.js";
import { Bone, BusyLabel, busy, isEmptySlot, type LoadingProps, useLoading } from "./skeleton.js";
import { drawn, largest, plotY, runs, scaleMax } from "./trend.js";
import { Overline } from "./typography.js";

/** The colour of a tile's value (and of its accent bar): plain ink, green, amber or red. */
export type StatTileTone = "neutral" | "positive" | "warn" | "danger";

const VALUE: Record<StatTileTone, string> = {
  neutral: "text-slate-900",
  positive: "text-emerald-700",
  warn: "text-amber-700",
  danger: "text-red-700",
};

const BAR: Record<StatTileTone, string> = {
  neutral: BAR_FILL.accent,
  positive: BAR_FILL.positive,
  warn: BAR_FILL.warn,
  danger: BAR_FILL.danger,
};

const LABEL_BONE = "inline-block h-[0.6lh] w-20 rounded align-middle";
const VALUE_BONE = "inline-block h-[0.7lh] w-28 rounded-md align-middle";

/** A slot's content, or a bone of `shape` while loading with nothing in it. */
function slot(loading: boolean, content: ReactNode, shape: string): ReactNode {
  return loading && isEmptySlot(content) ? <Bone shape={shape} /> : content;
}

/**
 * One headline figure: an uppercase caption over a large tabular-nums value, with an optional
 * hint line beneath. `tone` colours the value; `accent` adds a bar across the top edge in the same
 * tone. `trend` draws a small line under the value in the same colour. Pass the value already
 * formatted. While `loading`, a `label` or `value` not here yet is a bone; the hint and the trend
 * are drawn only once given.
 */
export function StatTile({
  label,
  value,
  hint,
  tone = "neutral",
  accent = false,
  trend,
  loading: ownLoading,
  loadingLabel,
  ...rest
}: {
  /** The small uppercase caption over the value. */
  label: ReactNode;
  /** The figure, already formatted, large and in tabular figures. */
  value: ReactNode;
  /** A muted line under the value. */
  hint?: ReactNode;
  /**
   * What the figure means: `neutral` (the default) a plain figure, `positive` good or on track,
   * `warn` at risk, `danger` failed or over. Say it in the text too: colour alone says nothing to a
   * screen reader.
   */
  tone?: StatTileTone;
  /** A bar across the top edge in the tone's colour. */
  accent?: boolean;
  /**
   * The figure over time, oldest first: a sparkline under the value, in its colour, on a scale
   * from 0. It is decoration, so say the trend in `hint` as well.
   */
  trend?: readonly number[];
} & LoadingProps &
  Passthrough): ReactElement {
  const { loading, owner } = useLoading(ownLoading);
  return (
    <div
      {...rest}
      {...busy(owner, loading)}
      className="relative overflow-hidden rounded-xl border border-slate-200/70 bg-white p-5 shadow-sm"
    >
      {accent && (
        <span aria-hidden="true" className={cx("absolute inset-x-0 top-0 h-1", BAR[tone])} />
      )}
      <Overline as="p" loading={false}>
        {slot(loading, label, LABEL_BONE)}
      </Overline>
      <p className={cx("mt-2 text-3xl font-bold tabular-nums", VALUE[tone])}>
        {slot(loading, value, VALUE_BONE)}
      </p>
      <BusyLabel owner={owner} loading={loading} label={loadingLabel} />
      {trend !== undefined && trend.length > 0 && <Sparkline values={trend} tone={tone} />}
      {hint != null && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

/** The tile's trend line: edge to edge, `h-8`, in the value's colour. Hidden from assistive tech. */
function Sparkline({
  values,
  tone,
}: {
  values: readonly number[];
  tone: StatTileTone;
}): ReactElement {
  const max = scaleMax(largest([values]));
  const step = values.length > 1 ? 100 / (values.length - 1) : 0;
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      className={cx("mt-3 block h-8 w-full overflow-visible", VALUE[tone])}
    >
      {runs(
        values.map((value, i) => {
          const y = drawn(value);
          return y === null ? null : { x: values.length > 1 ? step * i : 50, y: plotY(y, max) };
        }),
      ).map((points) => (
        <polyline
          key={points}
          points={points}
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
      ))}
    </svg>
  );
}
