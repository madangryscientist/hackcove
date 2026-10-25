import type { HTMLAttributes, ReactElement, ReactNode } from "react";
import { flushSync } from "react-dom";

const NAME = "hc-page";

// The one place the View Transitions pseudo-elements can be styled: a stylesheet, as Tailwind
// classes cannot reach `::view-transition-*`. No colour in it. Where the API is missing the rules
// are never matched; under reduced motion the snapshots swap with no animation.
const CSS = `[data-page-fade]{view-transition-name:${NAME}}
::view-transition-group(${NAME}){animation-duration:200ms}
::view-transition-old(${NAME}){animation:150ms ease-out both hc-page-fade-out}
::view-transition-new(${NAME}){animation:200ms ease-in both hc-page-fade-in}
@keyframes hc-page-fade-out{to{opacity:0}}
@keyframes hc-page-fade-in{from{opacity:0}}
@media (prefers-reduced-motion:reduce){::view-transition-group(${NAME}),::view-transition-old(${NAME}),::view-transition-new(${NAME}){animation:none}}`;

/**
 * The page's content area, named for the View Transitions API so a route change cross-fades it
 * while the frame around it (header, footer) stays put. Wrap what changes between pages, once per
 * page. The fade runs only when the navigation is wrapped in a view transition: `startPageTransition`,
 * or a router's own option (TanStack Router `viewTransition`, React Router's `viewTransition` prop,
 * Astro's `ClientRouter`). Otherwise, or where the browser has no View Transitions, it renders
 * and behaves as a plain `<div>`. Under `prefers-reduced-motion: reduce` the content swaps with no fade.
 */
export function PageFade({
  className,
  children,
  ...rest
}: { children: ReactNode } & HTMLAttributes<HTMLDivElement>): ReactElement {
  return (
    <div data-page-fade="" className={className} {...rest}>
      <style>{CSS}</style>
      {children}
    </div>
  );
}

/**
 * Run `update` (a state change or a navigation) inside a view transition, so a `PageFade` cross-fades.
 * `update` is flushed synchronously, as the browser needs the new DOM at once. Where the browser has
 * no View Transitions, or the user prefers reduced motion, `update` just runs. Call it from an event
 * handler, not during render.
 */
export function startPageTransition(update: () => void): void {
  const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
  if (reduce || typeof document.startViewTransition !== "function") {
    update();
    return;
  }
  document.startViewTransition(() => flushSync(update));
}
