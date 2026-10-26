import type { ReactElement } from "react";
import { cx } from "./cx.js";
import { announcedPercent, BAR_TRACK, type BarSize, sharePercent } from "./ProgressBar.js";
import type { Passthrough } from "./props.js";
import { TEXT_TONE, type TextTone } from "./typography.js";

/** One part of a `StackedBar`: its `label`, its `value` (its share is `value` over the sum) and its colour. */
export type StackedSegment = { label: string; value: number; tone: TextTone };

/** One entry of a `Legend`: the `label` the colour stands for, and an optional `detail` (a count, a share) after it. */
export type LegendItem = { label: string; tone: TextTone; detail?: string | number | undefined };

/** The colour of a swatch or a segment: the tone's text colour, painted as a fill, so no new palette entry. */
const FILL = (tone: TextTone): string => cx("bg-current", TEXT_TONE[tone]);

/**
 * A key to the colours of a chart or a row stripe: a swatch in the `TextTone` colour, its `label`
 * and an optional `detail` after it. Colour alone does not say it, so the label is always drawn.
 * `StackedBar legend` draws one under the bar from its segments.
 */
export function Legend({
  items,
  ...rest
}: { items: readonly LegendItem[] } & Passthrough): ReactElement {
  return (
    <ul {...rest} className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600">
      {items.map((item) => (
        <li key={item.label} className="flex items-center gap-1.5">
          <span
            aria-hidden="true"
            className={cx("size-2.5 shrink-0 rounded-full", FILL(item.tone))}
          />
          <span>{item.label}</span>
          {item.detail !== undefined && (
            <span className="tabular-nums text-slate-500">{item.detail}</span>
          )}
        </li>
      ))}
    </ul>
  );
}

/**
 * A bar of any number of parts, each sized by its share of the sum, in the order given. A part with
 * no value is zero wide. `label` names the bar for a screen reader, which hears every part's name
 * and whole percent (rounded, so they may not add up to exactly 100). `legend` draws a `Legend` under the bar, each part's
 * label with its value, so the colours are named in words.
 */
export function StackedBar({
  segments,
  label,
  legend = false,
  size = "lg",
  ...rest
}: {
  segments: readonly StackedSegment[];
  label: string;
  /** Draw the key under the bar. Defaults to false. */
  legend?: boolean;
  /** Defaults to "lg". */
  size?: BarSize;
} & Passthrough): ReactElement {
  const total = segments.reduce((sum, s) => sum + Math.max(0, s.value), 0);
  const spoken = segments.map((s) => `${s.label} ${announcedPercent(s.value, total)}%`).join(", ");
  return (
    <div {...rest} className="flex flex-col gap-2">
      <div
        role="img"
        aria-label={`${label}: ${spoken}`}
        className={cx("flex overflow-hidden rounded-full bg-slate-100", BAR_TRACK[size])}
      >
        {segments.map((s) => (
          <div
            key={s.label}
            className={FILL(s.tone)}
            style={{ width: `${sharePercent(s.value, total)}%` }}
          />
        ))}
      </div>
      {legend && (
        <Legend items={segments.map((s) => ({ label: s.label, tone: s.tone, detail: s.value }))} />
      )}
    </div>
  );
}
