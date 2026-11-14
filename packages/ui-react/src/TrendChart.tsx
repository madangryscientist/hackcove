import type { ReactElement } from "react";
import type { Passthrough } from "./props.js";
import { Legend, VIZ_TONE, type VizTone } from "./StackedBar.js";
import { drawn, largest, plotY, round, runs, scaleMax } from "./trend.js";

/**
 * One series of a `TrendChart`: its `label` (the table's column, the Legend's entry), its colour,
 * and one value per bucket in the buckets' order. A `null`, or a list shorter than the buckets, is
 * a missing value.
 */
export type TrendSeries = {
  label: string;
  tone: VizTone;
  values: readonly (number | null)[];
};

/** The most x labels drawn; past it, every k-th label is, starting with the first. */
const MAX_X_LABELS = 8;

/** Share of a bucket's width the bars of one bucket take, centred; the rest is the gap between buckets. */
const BAR_SPAN = 0.7;

const FORMAT = new Intl.NumberFormat("en-US");

/** Each series' values as drawn, one per bucket: negative is 0, missing is `null`. */
type Drawn = readonly (readonly (number | null)[])[];

/** A value as the table says it: as given, or blank when missing. */
const spoken = (value: number | null | undefined): string | null =>
  value == null || !Number.isFinite(value) ? null : FORMAT.format(value);

/**
 * A chart of one or two series over ordered buckets (weeks, months), as bars or a line, on a
 * y-axis from 0. The y-axis is labelled 0, half and a rounded maximum; the x-axis names the
 * buckets. A screen reader gets the same figures as a table.
 */
export function TrendChart({
  label,
  buckets,
  series,
  kind = "bar",
  ...rest
}: {
  /** What the chart shows: its accessible name and the caption of its table. */
  label: string;
  /** The x-axis labels, in order (`"W12"`, `"Mar"`). */
  buckets: readonly string[];
  /**
   * One or two series, each `{ label, tone, values }`. A `null` value, or a `values` list shorter
   * than `buckets`, is missing. Two series draw a Legend under the chart.
   */
  series: readonly [TrendSeries] | readonly [TrendSeries, TrendSeries];
  /**
   * `bar` for a count in each bucket, `line` for a level over time.
   * @default bar
   */
  kind?: "bar" | "line";
} & Passthrough): ReactElement {
  const values = series.map((s) => buckets.map((_, i) => drawn(s.values[i])));
  const max = scaleMax(largest(values));
  const ticks = [max, max / 2, 0];
  return (
    <figure {...rest} aria-label={label} className="flex flex-col gap-3">
      <div aria-hidden="true" className="flex gap-2 pt-2 text-xs tabular-nums text-slate-500">
        <YAxis ticks={ticks} max={max} />
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <div className="relative h-48">
            {ticks.map((tick) => (
              <span
                key={tick}
                className="absolute inset-x-0 border-t border-slate-200"
                style={{ top: `${plotY(tick, max)}%` }}
              />
            ))}
            <svg
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              className="absolute inset-0 size-full overflow-visible"
            >
              {kind === "bar" ? (
                <Bars series={series} values={values} max={max} />
              ) : (
                <Lines series={series} values={values} max={max} />
              )}
            </svg>
          </div>
          <XAxis buckets={buckets} />
        </div>
      </div>
      {series.length === 2 && (
        <Legend items={series.map((s) => ({ label: s.label, tone: s.tone }))} />
      )}
      <FigureTable label={label} buckets={buckets} series={series} />
    </figure>
  );
}

/** The y labels, each centred on its gridline; the widest (the top) sets the column's width. */
function YAxis({ ticks, max }: { ticks: readonly number[]; max: number }): ReactElement {
  return (
    <div className="relative h-48 shrink-0 text-right">
      <span className="invisible block">{FORMAT.format(max)}</span>
      {ticks.map((tick) => (
        <span
          key={tick}
          className="absolute right-0 -translate-y-1/2"
          style={{ top: `${plotY(tick, max)}%` }}
        >
          {FORMAT.format(tick)}
        </span>
      ))}
    </div>
  );
}

/** One equal column per bucket; past 8 buckets, every k-th label from the first. */
function XAxis({ buckets }: { buckets: readonly string[] }): ReactElement {
  const every = Math.max(1, Math.ceil(buckets.length / MAX_X_LABELS));
  return (
    <div
      className="grid text-center"
      style={{ gridTemplateColumns: `repeat(${buckets.length}, minmax(0, 1fr))` }}
    >
      {buckets.map((bucket, i) => (
        <span key={`${bucket}-${i}`} className="whitespace-nowrap">
          {i % every === 0 ? bucket : null}
        </span>
      ))}
    </div>
  );
}

type MarksProps = { series: readonly TrendSeries[]; values: Drawn; max: number };

/** A rect per present value, the series side by side in each bucket. */
function Bars({ series, values, max }: MarksProps): ReactElement {
  const width = 100 / Math.max(1, values[0]?.length ?? 1);
  const bar = (width * BAR_SPAN) / series.length;
  const inset = (width * (1 - BAR_SPAN)) / 2;
  return (
    <>
      {series.map((s, si) =>
        values[si]?.map((value, i) => {
          if (value === null) return null;
          const y = plotY(value, max);
          return (
            <rect
              key={`${si}-${i}`}
              data-bucket={i}
              className={VIZ_TONE[s.tone]}
              fill="currentColor"
              x={round(width * i + inset + bar * si)}
              y={round(y)}
              width={round(bar)}
              height={round(100 - y)}
            />
          );
        }),
      )}
    </>
  );
}

/** A polyline per run of present values, through the middle of each bucket. */
function Lines({ series, values, max }: MarksProps): ReactElement {
  const width = 100 / Math.max(1, values[0]?.length ?? 1);
  return (
    <>
      {series.map((s, si) =>
        runs(
          (values[si] ?? []).map((value, i) =>
            value === null ? null : { x: width * (i + 0.5), y: plotY(value, max) },
          ),
        ).map((points) => (
          <polyline
            key={`${si}-${points}`}
            className={VIZ_TONE[s.tone]}
            points={points}
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
        )),
      )}
    </>
  );
}

/** The chart's figures for a screen reader: a row per bucket, a column per series. */
function FigureTable({
  label,
  buckets,
  series,
}: {
  label: string;
  buckets: readonly string[];
  series: readonly TrendSeries[];
}): ReactElement {
  return (
    <table className="sr-only">
      <caption>{label}</caption>
      <thead>
        <tr>
          <td />
          {series.map((s, si) => (
            <th key={si} scope="col">
              {s.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {buckets.map((bucket, i) => (
          <tr key={`${bucket}-${i}`}>
            <th scope="row">{bucket}</th>
            {series.map((s, si) => (
              <td key={si}>{spoken(s.values[i])}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
