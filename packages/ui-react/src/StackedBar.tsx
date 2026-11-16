import type { ReactElement } from "react";
import { cx } from "./cx.js";
import { announcedPercent, BAR_TRACK, type BarSize, sharePercent } from "./ProgressBar.js";
import type { Passthrough } from "./props.js";
import { Bone, BusyLabel, busy, type LoadingProps, LoadingScope, useLoading } from "./skeleton.js";
import { TEXT_TONE, type TextTone } from "./typography.js";

/** The categorical scale: eight colours that say only "this category", never good or bad. */
export type CategoryTone = "cat1" | "cat2" | "cat3" | "cat4" | "cat5" | "cat6" | "cat7" | "cat8";

/**
 * The colour of a `StackedBar` segment, a `Legend` swatch or a `TrendChart` series: the `TextTone`
 * names, painted as a fill, or a category colour, `cat1` to `cat8`. On a chart `neutral` is a grey
 * of its own that sits apart from `muted` (for "unmeasured" next to "same"), and `accent` is the
 * theme's accent, apart from `info`. Categories with no meaning take `cat1` upwards in order; good
 * and bad take the meaning tones; one chart never mixes the two.
 */
export type VizTone = TextTone | CategoryTone;

/** Tone → text utility, painted as a fill. The `TextTone` colours are shared; `neutral` is the chart's own grey and `cat1` to `cat8` the categorical scale, each remapped by every theme. */
export const VIZ_TONE: Record<VizTone, string> = {
  ...TEXT_TONE,
  neutral: "text-neutral-500",
  cat1: "text-indigo-600",
  cat2: "text-orange-600",
  cat3: "text-teal-600",
  cat4: "text-pink-600",
  cat5: "text-lime-600",
  cat6: "text-fuchsia-600",
  cat7: "text-rose-600",
  cat8: "text-yellow-600",
};

/** One part of a `StackedBar`: its `label`, its `value` (its share is `value` over the sum) and its colour. */
export type StackedSegment = { label: string; value: number; tone: VizTone };

/** One entry of a `Legend`: the `label` the colour stands for, its swatch, and an optional `detail` (a count, a share) after it. */
export type LegendItem = {
  label: string;
  tone: VizTone;
  /**
   * `solid` (the default) is a filled dot; `dashed` is a dashed ring in the tone's colour with no
   * fill, the key for an outline drawn over the chart (a snapshot overlay).
   */
  swatch?: "solid" | "dashed" | undefined;
  detail?: string | number | undefined;
};

/** The colour of a segment: the tone's text colour, painted as a fill, so no new fill utility. */
const FILL = (tone: VizTone): string => cx("bg-current", VIZ_TONE[tone]);

/** A swatch: a filled dot, or a dashed ring in the same colour. */
const SWATCH = (item: LegendItem): string =>
  item.swatch === "dashed"
    ? cx("border-2 border-dashed border-current", VIZ_TONE[item.tone])
    : FILL(item.tone);

/**
 * A key to the colours of a chart or a row stripe: a swatch in the `VizTone` colour (a filled
 * dot, or a dashed ring with `swatch="dashed"`), its `label` and an optional `detail` after it. Colour alone does not say it, so the label is always drawn.
 * `StackedBar legend` draws one under the bar from its segments.
 * While `loading` with no `items` it draws three entries of bones.
 */
export function Legend({
  items,
  loading,
  loadingLabel,
  ...rest
}: {
  /** One entry per colour: its `label`, its `tone`, an optional `swatch` and `detail` (a count, a share). */
  items: readonly LegendItem[];
} & LoadingProps &
  Passthrough): ReactElement {
  const { loading: waiting, owner } = useLoading(loading);
  return (
    <ul
      {...rest}
      {...busy(owner, waiting)}
      className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600"
    >
      {waiting && items.length === 0 && <LegendBones />}
      {owner && waiting && <li className="sr-only">{loadingLabel ?? "Loading"}</li>}
      {items.map((item) => (
        <li key={item.label} className="flex items-center gap-1.5">
          <span aria-hidden="true" className={cx("size-2.5 shrink-0 rounded-full", SWATCH(item))} />
          <span>{item.label}</span>
          {item.detail !== undefined && (
            <span className="tabular-nums text-slate-500">{item.detail}</span>
          )}
        </li>
      ))}
    </ul>
  );
}

/** Three entries of bones, a swatch and a word each, for a key whose entries are not here yet. */
function LegendBones(): ReactElement {
  return (
    <>
      {[0, 1, 2].map((i) => (
        <li key={i} aria-hidden="true" className="flex items-center gap-1.5">
          <Bone shape="size-2.5 shrink-0 rounded-full" />
          <Bone shape="h-[0.6lh] w-12 rounded" />
        </li>
      ))}
    </>
  );
}

/** A bar still waiting for its figures: the track a bone, and the key's names if it has them. */
function WaitingStack({
  items,
  legend,
  size,
  own,
  label,
  attrs,
}: {
  items: readonly StackedSegment[];
  legend: boolean;
  size: BarSize;
  own: boolean | undefined;
  label: string | undefined;
  attrs: object;
}): ReactElement {
  const { loading, owner } = useLoading(own);
  return (
    <div {...attrs} {...busy(owner, loading)} className="flex flex-col gap-2">
      <Bone shape={cx("block w-full rounded-full", BAR_TRACK[size])} />
      {legend && (
        <LoadingScope loading>
          <Legend items={items.map((s) => ({ label: s.label, tone: s.tone }))} />
        </LoadingScope>
      )}
      <BusyLabel owner={owner} loading={loading} label={label} />
    </div>
  );
}

/**
 * A bar of any number of parts, each sized by its share of the sum, in the order given. A part with
 * no value is zero wide. `label` names the bar for a screen reader, which hears every part's name
 * and whole percent (rounded, so they may not add up to exactly 100). `legend` draws a `Legend` under the bar, each part's
 * label with its value, so the colours are named in words. While `loading` the bar is one bone (0
 * is a real value) and the key keeps the names it has, without their values.
 */
export function StackedBar({
  items,
  label,
  legend = false,
  size = "md",
  loading,
  loadingLabel,
  ...rest
}: {
  /** The parts in order, each a `label`, a `value` (its share is the value over the sum) and a `tone`. */
  items: readonly StackedSegment[];
  /** What the bar shows, for a screen reader, which hears it before every part's name and percent. */
  label: string;
  /** Draw the key under the bar. Defaults to false. */
  legend?: boolean;
  /**
   * The bar's height: `sm` 6px, `md` 8px, `lg` 12px.
   * @default md
   */
  size?: BarSize;
} & LoadingProps &
  Passthrough): ReactElement {
  if (useLoading(loading).loading) {
    return (
      <WaitingStack
        items={items}
        legend={legend}
        size={size}
        own={loading}
        label={loadingLabel}
        attrs={rest}
      />
    );
  }
  const total = items.reduce((sum, s) => sum + Math.max(0, s.value), 0);
  const spoken = items.map((s) => `${s.label} ${announcedPercent(s.value, total)}%`).join(", ");
  return (
    <div {...rest} className="flex flex-col gap-2">
      <div
        role="img"
        aria-label={`${label}: ${spoken}`}
        className={cx("flex overflow-hidden rounded-full bg-slate-100", BAR_TRACK[size])}
      >
        {items.map((s) => (
          <div
            key={s.label}
            className={FILL(s.tone)}
            style={{ width: `${sharePercent(s.value, total)}%` }}
          />
        ))}
      </div>
      {legend && (
        <Legend items={items.map((s) => ({ label: s.label, tone: s.tone, detail: s.value }))} />
      )}
    </div>
  );
}
