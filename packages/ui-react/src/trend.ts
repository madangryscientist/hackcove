/**
 * The scale shared by `TrendChart` and the `StatTile` sparkline. Internal: not exported from
 * `index.ts`.
 */

/**
 * The top of a y-axis that starts at 0: the smallest of 2, 4 or 10 times a whole power of ten
 * (1, 10, 100, …) that is at least `top`. Its half is then a whole number: 1 gives 2, 3 gives
 * 4, 5 gives 10, 13 gives 20. Nothing above 0 gives 2.
 */
export function scaleMax(top: number): number {
  for (let power = 1; ; power *= 10) {
    for (const step of [2, 4, 10]) {
      if (step * power >= top) return step * power;
    }
  }
}

/** A value as drawn: a negative one is 0, and a missing or non-finite one is `null`. */
export function drawn(value: number | null | undefined): number | null {
  if (value == null || !Number.isFinite(value)) return null;
  return Math.max(0, value);
}

/** The largest drawn value of every list, or 0. */
export function largest(lists: readonly (readonly (number | null)[])[]): number {
  let top = 0;
  for (const list of lists) {
    for (const value of list) top = Math.max(top, drawn(value) ?? 0);
  }
  return top;
}

/** `value` as a height on a 0 to 100 plot, measured down from the top (SVG's y). */
export function plotY(value: number, max: number): number {
  return 100 - (value / max) * 100;
}

/**
 * The polylines of a line through `points`, broken at every missing one: one `points` string per
 * run of present values. A run of one point repeats it, so a round cap draws it as a dot.
 */
export function runs(points: readonly ({ x: number; y: number } | null)[]): string[] {
  const out: string[] = [];
  let run: string[] = [];
  const close = (): void => {
    const [only] = run;
    if (run.length === 1 && only !== undefined) run.push(only);
    if (run.length > 0) out.push(run.join(" "));
    run = [];
  };
  for (const point of points) {
    if (point === null) close();
    else run.push(`${round(point.x)},${round(point.y)}`);
  }
  close();
  return out;
}

/** Four decimals, so the markup stays short and stable. */
export function round(n: number): number {
  return Math.round(n * 10000) / 10000;
}
