import type { ReactElement } from "react";
import { BAR_FILL } from "./ProgressBar.js";
import type { Passthrough } from "./props.js";

// The one place the bar's motion lives: a stylesheet, as Tailwind classes cannot declare
// `@keyframes`. Nothing here is a timer in script: the 150ms wait is the opacity animation's own
// delay (backwards fill, so the bar is invisible until it ends), and a navigation that finishes
// first removes the bar before it ever showed. A segment slides across the bar; under reduced
// motion it is a still, full-width bar. No colour in it, which the bar's own class carries.
const css = `@keyframes hc-navigation-progress-in{from{opacity:0}to{opacity:1}}
@keyframes hc-navigation-progress{from{transform:translateX(-100%)}to{transform:translateX(250%)}}
[data-navigation-progress]{animation:hc-navigation-progress-in .01s linear 150ms backwards}
[data-navigation-progress-bar]{width:40%;animation:hc-navigation-progress 1.4s ease-in-out infinite}
@media (prefers-reduced-motion:reduce){[data-navigation-progress-bar]{width:100%;animation:none}}`;

/**
 * A thin indeterminate bar along the top edge of the viewport, in the accent tone, for a route
 * change that is under way and has no known length. Pass `active` from the router's pending state
 * and render it once per app, beside the page frame. It draws exactly what `active` says: the bar
 * while it is true and nothing while it is false. The stylesheet holds it invisible for the first
 * 150ms, so a fast navigation shows nothing. It is fixed to the viewport and overlays the top of
 * the header, so nothing on the page moves. Under `prefers-reduced-motion: reduce` it is a still
 * bar.
 */
export function NavigationProgress({
  active,
  label = "Loading page",
  ...rest
}: {
  /** True while a navigation is pending, e.g. from the router's state. */
  active: boolean;
  /**
   * The bar's accessible name.
   * @default Loading page
   */
  label?: string;
} & Passthrough): ReactElement | null {
  if (!active) return null;
  return (
    <>
      <style>{css}</style>
      <div
        {...rest}
        role="progressbar"
        aria-label={label}
        data-navigation-progress=""
        className="pointer-events-none fixed inset-x-0 top-0 z-50 h-[3px] overflow-hidden"
      >
        <div data-navigation-progress-bar="" className={`h-full ${BAR_FILL.accent}`} />
      </div>
    </>
  );
}
