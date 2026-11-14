import {
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type MouseEvent,
  type ReactElement,
} from "react";
import { focusRing } from "./cx.js";
import type { Unstyled } from "./props.js";

const BASE = `shrink-0 rounded px-1.5 py-0.5 font-sans text-xs text-slate-400 hover:bg-slate-100 disabled:pointer-events-none disabled:opacity-50 ${focusRing}`;

/** Both labels share one grid cell, so the button is as wide as the longer and never resizes. */
const CELL = "col-start-1 row-start-1";

// The copied state is CSS, not a timer: a copy sets `data-copied` on the button, and for two seconds
// an animation hides `label` and shows `copiedLabel`; when it ends, the resting styles are back.
// `visibility` is discrete, so each keyframe holds one value for the whole run. A second copy starts
// the run again: React remounts both labels, `copyScript` re-sets the attribute after a reflow.
const css = `[data-copied] [data-copy-idle]{animation:hc-copy-idle 2s}[data-copied] [data-copy-done]{animation:hc-copy-done 2s}@keyframes hc-copy-idle{from,to{visibility:hidden}}@keyframes hc-copy-done{from,to{visibility:visible}}`;

/** Writes `text` to the clipboard and shows `copiedLabel` for two seconds, then `label` again. Defaults to `type="button"`. Its accessible name stays `label`; a polite status region beside it announces `copiedLabel` on each copy. A refused or missing clipboard leaves it on `label`. Every other button prop, `disabled` included, goes on the `<button>`. On a page rendered to static HTML without hydration, inline `copyScript` and the button works there too. */
export function CopyButton({
  text,
  label = "copy",
  copiedLabel = "copied",
  onClick,
  ...rest
}: {
  /** What goes on the clipboard. */
  text: string;
  /**
   * The button's text, and its accessible name.
   * @default copy
   */
  label?: string;
  /**
   * The text shown for two seconds once the copy has gone through, and announced.
   * @default copied
   */
  copiedLabel?: string;
} & Unstyled<Omit<ComponentPropsWithoutRef<"button">, "children">>): ReactElement {
  /** How many copies went through: the key that restarts the labels and the announcement. */
  const [copies, setCopies] = useState(0);
  const status = useRef<HTMLSpanElement>(null);
  return (
    <>
      <style>{css}</style>
      <button
        type="button"
        aria-label={label}
        {...rest}
        // What `copyScript` reads on a page that is never hydrated.
        data-copy-text={text}
        data-copy-copied={copiedLabel}
        data-copied={copies > 0 ? "" : undefined}
        // `copyScript` may have set `data-copied` before this button hydrated; React leaves it be.
        suppressHydrationWarning
        className={BASE}
        onClick={(event: MouseEvent<HTMLButtonElement>) => {
          onClick?.(event);
          // `copyScript` hears this same click on `document`. Whichever of the two runs first copies
          // and flags the event, so the other skips it.
          const native: Event & { copyHandled?: true } = event.nativeEvent;
          if (native.copyHandled) return;
          native.copyHandled = true;
          // The rejection is swallowed on purpose: a denied write is not an error the page can act on.
          navigator.clipboard?.writeText(text).then(
            () => {
              setCopies((n) => n + 1);
              // A new text node each time, so a second copy is announced too. Set here, not
              // rendered, as `copyScript` does, so a region it filled before hydration still matches.
              status.current?.replaceChildren(copiedLabel);
            },
            () => {},
          );
        }}
      >
        <span key={copies} className="grid">
          <span data-copy-idle="" className={CELL}>
            {label}
          </span>
          <span data-copy-done="" aria-hidden="true" className={`invisible ${CELL}`}>
            {copiedLabel}
          </span>
        </span>
      </button>
      {/* `sr-only` is absolute, so the region takes no room in the row the button sits in. Its text
          is never rendered (the empty string keeps React from hydrating children it does not own). */}
      <span
        ref={status}
        role="status"
        data-copy-status=""
        className="sr-only"
        suppressHydrationWarning
      >
        {""}
      </span>
    </>
  );
}
