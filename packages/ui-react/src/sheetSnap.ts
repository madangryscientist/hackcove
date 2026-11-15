/** A snap height: a number from 0 to 1 is a share of the parent's height, a `"120px"` string is pixels. */
export type BottomSheetSnap = number | `${number}px`;

/** A release at this speed or faster (px per ms, by `PointerEvent.timeStamp`) is a fling. */
export const FLING = 0.5;

/** A last sample older than this (ms) before the release means the pointer stopped: no fling. */
const STALE = 100;

/** The snap's height in CSS, which the server render and a page without JavaScript show as is. */
export function snapCss(snap: BottomSheetSnap): string {
  return typeof snap === "number" ? `${snap * 100}%` : snap;
}

/**
 * The snap's height in pixels against a parent `parent` px tall, held at the parent's height. A
 * parent with no height (not laid out yet, or jsdom) holds nothing back, so a pixel snap reads as given.
 */
export function snapPx(snap: BottomSheetSnap, parent: number): number {
  const px = typeof snap === "number" ? snap * parent : Number.parseFloat(snap);
  return parent > 0 ? Math.min(px, parent) : px;
}

/** One pointer sample of a drag: the sheet's height and the event's `timeStamp`. */
export type SheetSample = { height: number; t: number };

/**
 * The release velocity in px per ms, up positive: the last two samples' change in height over their
 * change in time, or 0 when the last one is more than 100ms before the release (the pointer stopped).
 */
export function releaseVelocity(samples: readonly SheetSample[], releasedAt: number): number {
  const last = samples.at(-1);
  const before = samples.at(-2);
  if (!last || !before || last.t <= before.t || releasedAt - last.t > STALE) return 0;
  return (last.height - before.height) / (last.t - before.t);
}

/**
 * The snap a released drag rests at. The nearest by distance (a tie goes to the lower); a fling
 * moves it at least one snap from `startSnap` in its direction, held to the ends. A fling only adds
 * a step, never takes one away, so a long drag lands on the same snap at any speed.
 */
export function restingSnap(
  heights: readonly number[],
  height: number,
  velocity: number,
  startSnap: number,
): number {
  let nearest = 0;
  heights.forEach((h, i) => {
    if (Math.abs(h - height) < Math.abs((heights[nearest] ?? 0) - height)) nearest = i;
  });
  const last = heights.length - 1;
  if (velocity >= FLING) return Math.min(last, Math.max(nearest, startSnap + 1));
  if (velocity <= -FLING) return Math.max(0, Math.min(nearest, startSnap - 1));
  return nearest;
}
