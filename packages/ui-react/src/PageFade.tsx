import type { ReactElement, ReactNode } from "react";
import { flushSync } from "react-dom";
import type { Passthrough } from "./props.js";

// The one place the View Transitions pseudo-elements can be styled: a stylesheet, as Tailwind
// classes cannot reach `::view-transition-*`. The browser's own cross-fade does the fading; under
// reduced motion this switches the animations off so the content swaps. With no name the fade is
// the browser's root transition, captured at the viewport's size; a named box is captured at its
// full height, which on a long page costs seconds in WebKit. No colour in it. Where the API is
// missing the rules are never matched.
const quiet = (name: string): string =>
  `@media (prefers-reduced-motion:reduce){::view-transition-group(${name}),::view-transition-old(${name}),::view-transition-new(${name}){animation:none}}`;

const css = (name: string | undefined): string =>
  name === undefined
    ? quiet("root")
    : `[data-page-fade="${name}"]{view-transition-name:${name}}\n${quiet(name)}`;

/**
 * The page's content area, cross-faded by the View Transitions API when the route changes. Wrap
 * what changes between pages, once per page. With no `name` the fade is the browser's own
 * cross-fade of the whole viewport; the frame around the content (header, footer) stays still
 * because it is the same on both pages. A `name` names this box so it fades apart from the page,
 * for a second region; a named region is captured at its full height, so name only a region no
 * taller than the screen, and give each named one on a page its own `name`.
 * The fade runs only when the navigation is wrapped in a view transition: `startPageTransition`,
 * or a router's own option (TanStack Router `viewTransition`, React Router's `viewTransition` prop,
 * Astro's `ClientRouter`). Otherwise, or where the browser has no View Transitions, it renders
 * and behaves as a plain `<div>`. A named PageFade is a stacking context, so a dropdown inside it
 * cannot rise above a sticky header outside it: portal overlays to the body. The default one is
 * not. Under `prefers-reduced-motion: reduce` the content swaps with no fade; a named one quiets
 * only its own box, and a router's own transition of the rest of the page is the router's to quiet.
 */
export function PageFade({
  name,
  children,
  ...rest
}: {
  /** A view-transition name for this box, a CSS identifier (letters, digits, `-`, `_`), for a region no taller than the screen that fades apart from the page. */
  name?: string;
  children: ReactNode;
} & Passthrough): ReactElement {
  return (
    <>
      <style>{css(name)}</style>
      <div {...rest} data-page-fade={name}>
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
