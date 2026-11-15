import {
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
  type ReactElement,
  type ReactNode,
  type RefObject,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { focusRing } from "./cx.js";
import type { Passthrough } from "./props.js";
import { GapProvider } from "./stackGap.js";
import {
  type BottomSheetSnap,
  releaseVelocity,
  restingSnap,
  type SheetSample,
  snapCss,
  snapPx,
} from "./sheetSnap.js";

export type { BottomSheetSnap } from "./sheetSnap.js";

const SHEET =
  "absolute inset-x-0 bottom-0 z-10 flex max-h-full flex-col overflow-hidden rounded-t-2xl border border-b-0 border-slate-200 bg-white pb-[env(safe-area-inset-bottom)] text-slate-900 shadow-2xl transition-[height] duration-200 ease-out data-dragging:transition-none motion-reduce:transition-none md:start-4 md:end-auto md:w-96";

const HANDLE = `flex h-6 w-full shrink-0 cursor-grab touch-none items-center justify-center text-slate-400 active:cursor-grabbing ${focusRing} focus-visible:-outline-offset-2`;

/** Pointer travel (px) under which a press on the handle is a tap, not a drag. */
const TAP = 6;

/** The pill grip on the handle. */
const GRIP = (
  <svg viewBox="0 0 36 4" fill="currentColor" aria-hidden="true" className="h-1 w-9">
    <rect width="36" height="4" rx="2" />
  </svg>
);

export type BottomSheetProps = {
  /** The sheet's accessible name, as a region, and its handle button's. */
  label: string;
  /**
   * The heights it rests at, lowest first, at least two: a number from 0 to 1 is a share of the
   * parent's height, a `"120px"` string is pixels. A snap taller than the parent is held at its height.
   */
  snaps: readonly [BottomSheetSnap, BottomSheetSnap, ...BottomSheetSnap[]];
  /** The current snap, an index into `snaps`. Render the first (0) first and a page with no JavaScript shows it. */
  snap: number;
  /** Called with the snap to move to: from the handle, a drag, or Escape (back to 0). Set `snap` here. */
  onSnapChange: (snap: number) => void;
  /** The row under the handle: a heading and a count. It stays put while the body scrolls. */
  header?: ReactNode;
  /** Actions pinned under the scrolling body. */
  footer?: ReactNode;
  /** The scrolling body. */
  children?: ReactNode;
  /**
   * Called with the height (px) the sheet rests at: on mount, on every change of `snap` and when the
   * parent resizes. Pad a map camera by it.
   */
  onHeightChange?: (px: number) => void;
} & Passthrough;

type Drag = {
  pointer: number;
  startY: number;
  startHeight: number;
  heights: number[];
  startSnap: number;
  samples: SheetSample[];
  moved: boolean;
};

const parentOf = (el: HTMLElement): HTMLElement | null =>
  el.offsetParent instanceof HTMLElement ? el.offsetParent : el.parentElement;

/** Report the height the sheet rests at: now, on a change of snap, and when its parent resizes. */
function useReportedHeight(
  sheet: RefObject<HTMLElement | null>,
  resting: BottomSheetSnap,
  onHeightChange: ((px: number) => void) | undefined,
): void {
  const report = useRef(onHeightChange);
  const reported = useRef<number | null>(null);
  useEffect(() => {
    report.current = onHeightChange;
  });
  useEffect(() => {
    const el = sheet.current;
    const parent = el && parentOf(el);
    if (!parent) return undefined;
    const send = () => {
      const px = snapPx(resting, parent.clientHeight);
      if (px === reported.current) return;
      reported.current = px;
      report.current?.(px);
    };
    send();
    // jsdom (a consumer's own tests) has no ResizeObserver.
    if (typeof ResizeObserver === "undefined") return undefined;
    const observer = new ResizeObserver(send);
    observer.observe(parent);
    return () => observer.disconnect();
  }, [sheet, resting]);
}

type Snapping = Pick<BottomSheetProps, "snaps" | "snap" | "onSnapChange">;

/**
 * The handle's drag, on plain pointer events: the height while dragging (`null` at rest) and the
 * handle's handlers. Under 6px of travel a press is a tap and the button's click steps the snap; a
 * drag releases to `restingSnap`, and the click after it is swallowed.
 */
function useSheetDrag(
  sheet: RefObject<HTMLElement | null>,
  { snaps, snap, onSnapChange }: Snapping,
) {
  const drag = useRef<Drag | null>(null);
  /** A drag just ended: swallow the click the browser fires after its `pointerup`. */
  const dragged = useRef(false);
  const [dragHeight, setDragHeight] = useState<number | null>(null);

  const onPointerDown = (event: PointerEvent<HTMLButtonElement>) => {
    // A second finger on the handle mid-drag is ignored: the first pointer's release ends the drag.
    if (drag.current) return;
    dragged.current = false;
    const el = sheet.current;
    const parent = el && parentOf(el);
    if (!el || !parent || (event.pointerType === "mouse" && event.button !== 0)) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    const height = el.getBoundingClientRect().height;
    drag.current = {
      pointer: event.pointerId,
      startY: event.clientY,
      startHeight: height,
      heights: snaps.map((s) => snapPx(s, parent.clientHeight)),
      startSnap: snap,
      samples: [{ height, t: event.timeStamp }],
      moved: false,
    };
  };

  const onPointerMove = (event: PointerEvent<HTMLButtonElement>) => {
    const d = drag.current;
    if (!d || d.pointer !== event.pointerId) return;
    const travel = event.clientY - d.startY;
    if (!d.moved && Math.abs(travel) < TAP) return;
    d.moved = true;
    const height = Math.min(
      Math.max(d.startHeight - travel, d.heights[0] ?? 0),
      d.heights.at(-1) ?? 0,
    );
    d.samples = [...d.samples.slice(-1), { height, t: event.timeStamp }];
    setDragHeight(height);
  };

  const release = (event: PointerEvent<HTMLButtonElement>, still: boolean) => {
    const d = drag.current;
    if (!d || d.pointer !== event.pointerId) return;
    drag.current = null;
    if (!d.moved) return;
    dragged.current = true;
    const height = d.samples.at(-1)?.height ?? d.startHeight;
    const velocity = still ? 0 : releaseVelocity(d.samples, event.timeStamp);
    setDragHeight(null);
    onSnapChange(restingSnap(d.heights, height, velocity, d.startSnap));
  };

  const onClick = (event: MouseEvent<HTMLButtonElement>) => {
    // A second finger's tap mid-drag: the drag's release decides the snap.
    if (drag.current) return;
    // A keyboard click (`detail` 0) is never the tail of a drag.
    const swallow = dragged.current && event.detail !== 0;
    dragged.current = false;
    if (!swallow) onSnapChange((snap + 1) % snaps.length);
  };

  return {
    dragHeight,
    handle: {
      onClick,
      onPointerDown,
      onPointerMove,
      onPointerUp: (event: PointerEvent<HTMLButtonElement>) => release(event, false),
      onPointerCancel: (event: PointerEvent<HTMLButtonElement>) => release(event, true),
    },
  };
}

/**
 * A non-modal panel docked to the bottom edge of its positioned parent, over a full-screen view (a
 * map, a canvas) that stays usable behind it. It rests at one of its `snaps`; the handle steps
 * through them (Enter and Space), a drag of the handle moves it and releases to the nearest snap
 * (a fling steps on), and Escape inside it returns it to the first. Nothing is made inert and focus
 * never moves. Full width below `md`, a panel at the start edge from `md` up.
 */
export function BottomSheet({
  label,
  snaps,
  snap,
  onSnapChange,
  header,
  footer,
  children,
  onHeightChange,
  ...rest
}: BottomSheetProps): ReactElement {
  const sheet = useRef<HTMLElement>(null);
  const bodyId = useId();
  const resting = snaps[snap] ?? snaps[0];
  useReportedHeight(sheet, resting, onHeightChange);
  const { dragHeight, handle } = useSheetDrag(sheet, { snaps, snap, onSnapChange });

  const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key !== "Escape" || event.defaultPrevented || snap === 0) return;
    const target = event.target instanceof Element ? event.target : null;
    const dialog = target?.closest("dialog");
    if (dialog && sheet.current?.contains(dialog)) return;
    event.preventDefault();
    onSnapChange(0);
  };

  return (
    <section
      {...rest}
      ref={sheet}
      aria-label={label}
      onKeyDown={onKeyDown}
      data-dragging={dragHeight === null ? undefined : ""}
      className={SHEET}
      style={{ height: dragHeight === null ? snapCss(resting) : `${dragHeight}px` }}
    >
      <button
        {...handle}
        type="button"
        aria-label={label}
        aria-expanded={snap > 0}
        aria-controls={bodyId}
        className={HANDLE}
      >
        {GRIP}
      </button>
      {header != null && (
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-200 px-5.5 pb-3.5">
          {header}
        </div>
      )}
      <div id={bodyId} className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5.5 py-4">
        <GapProvider gap="xs">{children}</GapProvider>
      </div>
      {footer != null && (
        <footer className="flex shrink-0 justify-end gap-2 border-t border-slate-200 px-5.5 py-3.5">
          {footer}
        </footer>
      )}
    </section>
  );
}
