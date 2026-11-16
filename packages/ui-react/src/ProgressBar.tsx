import type { ReactElement } from "react";
import { cx } from "./cx.js";
import type { Passthrough } from "./props.js";
import type { Size } from "./size.js";
import { type LoadingProps, useLoading, WaitingBone } from "./skeleton.js";

/** The colour of a bar's fill. */
export type BarTone = "accent" | "positive" | "warn" | "danger";

/** 6px, 8px or 12px tall. */
export type BarSize = Size;

export const BAR_FILL: Record<BarTone, string> = {
  accent: "bg-violet-600",
  positive: "bg-emerald-600",
  warn: "bg-amber-600",
  danger: "bg-red-600",
};

export const BAR_TRACK: Record<BarSize, string> = {
  sm: "h-1.5",
  md: "h-2",
  lg: "h-3",
};

/** `part` as a percent of `whole`, held between 0 and 100; 0 when either is not positive. */
export function sharePercent(part: number, whole: number): number {
  if (!(whole > 0) || !(part > 0)) return 0;
  return Math.min(100, (part / whole) * 100);
}

/** The share as a whole percent for a screen reader: never 0 or 100 unless it truly is. */
export function announcedPercent(part: number, whole: number): number {
  const share = sharePercent(part, whole);
  return share <= 0 || share >= 100 ? share : Math.min(99, Math.max(1, Math.round(share)));
}

/**
 * A bar with no figures yet: one bone the track's height across the full width. `attrs` keeps the
 * bar's role and name, so it is still its progressbar or picture while it waits.
 */
export function WaitingBar({
  own,
  label,
  size,
  attrs,
}: {
  own: boolean | undefined;
  label: string | undefined;
  size: BarSize;
  attrs: object;
}): ReactElement {
  return (
    <WaitingBone
      own={own}
      label={label}
      shape={cx("block w-full rounded-full", BAR_TRACK[size])}
      root="block"
      attrs={attrs}
    />
  );
}

/**
 * A thin horizontal bar with a filled share, for progress toward a total. `value` is held
 * between 0 and `max`. `label` names what it measures, for a screen reader, which also hears the percentage.
 * While `loading` it is one bone the bar's size, since 0 is a real value.
 */
export function ProgressBar({
  value,
  max = 100,
  label,
  tone = "accent",
  size = "md",
  loading,
  loadingLabel,
  ...rest
}: {
  /** How far along, held between 0 and `max`. */
  value: number;
  /** The value that fills the bar; `value` is drawn as its share of this. Defaults to 100. */
  max?: number;
  /** What the bar measures, for a screen reader, which also hears the percentage. */
  label: string;
  /**
   * What the progress means: `accent` (the default) plain progress, `positive` done or on track,
   * `warn` at risk, `danger` over a limit or failed.
   */
  tone?: BarTone;
  /**
   * The bar's height: `sm` 6px, `md` 8px, `lg` 12px.
   * @default md
   */
  size?: BarSize;
} & LoadingProps &
  Passthrough): ReactElement {
  const waiting = useLoading(loading).loading;
  if (waiting) {
    // No `aria-valuenow`: a progressbar with no value is indeterminate.
    const attrs = { ...rest, role: "progressbar", "aria-label": label };
    return <WaitingBar own={loading} label={loadingLabel} size={size} attrs={attrs} />;
  }
  const share = sharePercent(value, max);
  return (
    <div
      {...rest}
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={announcedPercent(value, max)}
      className={cx("overflow-hidden rounded-full bg-slate-100", BAR_TRACK[size])}
    >
      <div className={cx("h-full", BAR_FILL[tone])} style={{ width: `${share}%` }} />
    </div>
  );
}
