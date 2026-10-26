import type { ReactElement } from "react";
import { cx } from "./cx.js";
import type { Passthrough } from "./props.js";

/** The colour of a bar's fill. */
export type BarTone = "accent" | "positive" | "warn" | "negative";

/** 6px, 8px or 12px tall. */
export type BarSize = "sm" | "md" | "lg";

export const BAR_FILL: Record<BarTone, string> = {
  accent: "bg-violet-600",
  positive: "bg-emerald-600",
  warn: "bg-amber-600",
  negative: "bg-red-600",
};

export const BAR_TRACK: Record<BarSize, string> = {
  sm: "h-1.5",
  md: "h-2",
  lg: "h-3",
};

/** `part` as a percent of `whole`, held to 0–100; 0 when either is not positive. */
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
 * A thin horizontal bar with a filled share, for progress toward a total. `value` is held to
 * 0–`max`. `label` names what it measures, for a screen reader, which also hears the percentage.
 */
export function ProgressBar({
  value,
  max = 100,
  label,
  tone = "accent",
  size = "sm",
  ...rest
}: {
  value: number;
  /** Defaults to 100. */
  max?: number;
  label: string;
  /** Defaults to "accent". */
  tone?: BarTone;
  /** Defaults to "sm". */
  size?: BarSize;
} & Passthrough): ReactElement {
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
