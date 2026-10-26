import type { ReactElement } from "react";
import { cx } from "./cx.js";
import {
  BAR_FILL,
  BAR_TRACK,
  announcedPercent,
  sharePercent,
  type BarSize,
  type BarTone,
} from "./ProgressBar.js";
import type { Passthrough } from "./props.js";

/**
 * A bar split between two parties, `a` on the left and `b` on the right, each sized by its share of
 * `a + b`. `label` names the split for a screen reader, which hears both percentages; give `names`
 * (left, right) so it hears whose is whose. Put the parties' names under the bar yourself.
 */
export function SplitBar({
  a,
  b,
  label,
  names,
  toneA = "negative",
  toneB = "positive",
  size = "lg",
  ...rest
}: {
  a: number;
  b: number;
  label: string;
  /** The left and right parties, spoken before their percentages. */
  names?: readonly [string, string];
  /** Defaults to "negative". */
  toneA?: BarTone;
  /** Defaults to "positive". */
  toneB?: BarTone;
  /** Defaults to "lg". */
  size?: BarSize;
} & Passthrough): ReactElement {
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
