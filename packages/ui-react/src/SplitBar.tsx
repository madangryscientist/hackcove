import type { ReactElement } from "react";
import { cx } from "./cx.js";
import {
  BAR_FILL,
  BAR_TRACK,
  announcedPercent,
  sharePercent,
  type BarSize,
  type BarTone,
  WaitingBar,
} from "./ProgressBar.js";
import { type LoadingProps, useLoading } from "./skeleton.js";
import type { Passthrough } from "./props.js";

/**
 * A bar split between two parties, `a` on the left and `b` on the right, each sized by its share of
 * `a + b`. `label` names the split for a screen reader, which hears both percentages; give `names`
 * (left, right) so it hears whose is whose. Put the parties' names under the bar yourself.
 * While `loading` it is one bone the bar's size, since 0 is a real value.
 */
export function SplitBar({
  a,
  b,
  label,
  names,
  toneA = "danger",
  toneB = "positive",
  size = "md",
  loading,
  loadingLabel,
  ...rest
}: {
  /** The left party's amount; its share is `a` over `a + b`. */
  a: number;
  /** The right party's amount; its share is `b` over `a + b`. */
  b: number;
  /** What the split is, for a screen reader, which hears it before both percentages. */
  label: string;
  /** The left and right parties, spoken before their percentages. */
  names?: readonly [string, string];
  /** The left part's colour, by what it means (`accent`, `positive`, `warn` or `danger`). Defaults to "danger". */
  toneA?: BarTone;
  /** The right part's colour, by what it means (`accent`, `positive`, `warn` or `danger`). Defaults to "positive". */
  toneB?: BarTone;
  /**
   * The bar's height: `sm` 6px, `md` 8px, `lg` 12px.
   * @default md
   */
  size?: BarSize;
} & LoadingProps &
  Passthrough): ReactElement {
  const waiting = useLoading(loading).loading;
  if (waiting) {
    const attrs = { ...rest, role: "img", "aria-label": label };
    return <WaitingBar own={loading} label={loadingLabel} size={size} attrs={attrs} />;
  }
  const shareA = sharePercent(a, a + b);
  const shareB = a + b > 0 ? 100 - shareA : 0;
  const percentA = announcedPercent(a, a + b);
  const percentB = a + b > 0 ? 100 - percentA : 0;
  return (
    <div
      {...rest}
      role="img"
      aria-label={`${label}: ${names ? `${names[0]} ${percentA}%, ${names[1]} ${percentB}%` : `${percentA}% / ${percentB}%`}`}
      className={cx("flex overflow-hidden rounded-full bg-slate-100", BAR_TRACK[size])}
    >
      <div className={BAR_FILL[toneA]} style={{ width: `${shareA}%` }} />
      <div className={BAR_FILL[toneB]} style={{ width: `${shareB}%` }} />
    </div>
  );
}
