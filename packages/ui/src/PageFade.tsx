import type { HTMLAttributes, ReactElement, ReactNode } from "react";
import { flushSync } from "react-dom";

const DEFAULT_NAME = "hc-page";

// The one place the View Transitions pseudo-elements can be styled: a stylesheet, as Tailwind
// classes cannot reach `::view-transition-*`. The browser's own cross-fade does the fading; this
// names the element and, under reduced motion, switches the animations off so the content swaps.
// No colour in it. Where the API is missing the rules are never matched.
const css = (name: string): string =>
  `[data-page-fade="${name}"]{view-transition-name:${name}}
@media (prefers-reduced-motion:reduce){::view-transition-group(${name}),::view-transition-old(${name}),::view-transition-new(${name}){animation:none}}`;

/**
 * The page's content area, named for the View Transitions API so a route change cross-fades it
 * while the frame around it (header, footer) stays put. Wrap what changes between pages, once per
 * page: two on one page need a different `name` each, or the browser skips the transition.
 * The fade runs only when the navigation is wrapped in a view transition: `startPageTransition`,
 * or a router's own option (TanStack Router `viewTransition`, React Router's `viewTransition` prop,
 * Astro's `ClientRouter`). Otherwise, or where the browser has no View Transitions, it renders
 * and behaves as a plain `<div>`. A `view-transition-name` makes the div a stacking context, so a
 * dropdown inside it cannot rise above a sticky header outside it: portal overlays to the body. Under `prefers-reduced-motion: reduce` this content swaps with no fade; a router's own
 * transition of the rest of the page is the router's to quiet.
 */
export function PageFade({
  name = DEFAULT_NAME,
  className,
  children,
  ...rest
}: {
  /** The view-transition name, a CSS identifier (letters, digits, `-`, `_`). */
  name?: string;
  children: ReactNode;
} & HTMLAttributes<HTMLDivElement>): ReactElement {
  return (
    <>
      <style>{css(name)}</style>
      <div data-page-fade={name} className={className} {...rest}>
        {children}
      </div>
    </>
  );
}

/**
 * Run `update` inside a view transition, so a `PageFade` cross-fades. `update` is a synchronous
 * state change, flushed at once as the browser needs the new DOM; for a router's navigation, which
 * is async, use the router's own view-transition option instead. Where the browser has
 * no View Transitions, or the user prefers reduced motion, `update` just runs. Call it from an event
 * handler, not during render.
 */
export function startPageTransition(update: () => void): void {
  const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
  if (reduce || typeof document.startViewTransition !== "function") {
    update();
    return;
  }
  // A skipped transition (a second one starting, a hidden tab) rejects `ready`; the update still ran.
  document.startViewTransition(() => flushSync(update)).ready.catch(() => {});
}
