import { type ReactElement, type ReactNode, useLayoutEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import type { Passthrough } from "./props.js";

// Keeps letters and digits and writes every other character, `-` and `_` included, as
// `_<hex code point>_`, so two different pairs never give one name and no character can end the
// attribute selector or the rule.
const enc = (value: string): string =>
  Array.from(value, (ch) =>
    /[A-Za-z0-9]/.test(ch) ? ch : `_${(ch.codePointAt(0) ?? 0).toString(16)}_`,
  ).join("");

const morphName = (name: string, item: string | number): string =>
  `hc-morph-${enc(name)}-${enc(String(item))}`;

// As in PageFade: the one place the View Transitions pseudo-elements can be styled is a stylesheet.
// The browser's own group animation moves and resizes the box and cross-fades its content; this
// names the element and gives the group and both images the library's one morph timing, 450 ms on
// an ease that starts quick and settles gently (the browser's default 250 ms is too quick to see),
// so the cross-fade lasts as long as the move. Under reduced motion the later rule switches the
// animations off so it swaps. No colour in it. Where the API is missing the rules are never matched.
// The name applies only while the element carries `data-morph-near` (within a screen of the
// viewport): a named element is captured whole before a transition, so naming every card of a long
// list makes the browser (WebKit worst) capture pixels nobody sees.
const css = (n: string): string =>
  `[data-morph="${n}"][data-morph-near]{view-transition-name:${n}}
::view-transition-group(${n}),::view-transition-old(${n}),::view-transition-new(${n}){animation-duration:450ms;animation-timing-function:cubic-bezier(0.2,0,0,1)}
@media (prefers-reduced-motion:reduce){::view-transition-group(${n}),::view-transition-old(${n}),::view-transition-new(${n}){animation:none}}`;

/**
 * An element that grows into its counterpart on the next page, and shrinks back on Back, through
 * the View Transitions API. Wrap the card in the list and the element on the detail page, each with
 * the same `name` and the record's id as `item`: the browser morphs one into the other over 450 ms. The same
 * `name` and `item` may appear only once on a page; two on one page and the browser skips the
 * morph, so a list passes each record's own id. The morph runs only when the change is wrapped in a
 * view transition: `startPageTransition`, or a router's own option (TanStack Router
 * `defaultViewTransition: true` on `createRouter`, or `viewTransition` on a `Link`; React Router's
 * `viewTransition`, Astro's `ClientRouter`). Otherwise, or where the browser has no View
 * Transitions, it renders and behaves as a plain `<div>`. Inside a `PageFade` the page fades while
 * this element morphs. While it is named (near the screen) the div is a stacking context, so a
 * dropdown inside it cannot rise above a sticky header outside it: portal overlays to the body. Under
 * `prefers-reduced-motion: reduce` it swaps with no animation; a router's own transition of the
 * rest of the page is the router's to quiet. A Morph more than a screen above or below the viewport
 * carries no transition name until it scrolls near, so a long list costs only what is on screen.
 */
export function Morph({
  name,
  item,
  children,
  ...rest
}: {
  /** What the element is, shared by the card and its detail: `"shop"`, `"product"`. Any text. */
  name: string;
  /** Which one, usually the record's id. Any text or number; unique on the page for one `name`. */
  item: string | number;
  children: ReactNode;
} & Passthrough): ReactElement {
  const n = morphName(name, item);
  const ref = useRef<HTMLDivElement>(null);
  // Named until measured, so the server render and an engine with no IntersectionObserver keep the
  // name. The layout effect's update is flushed with the render, so inside a view transition's
  // update the new page's far cards are already unnamed when the browser captures it. A parent's
  // layout effect runs after this one and may scroll this element on screen (a router restoring
  // the list's scroll on Back), so a microtask measures again once the whole commit is done and
  // flushes the result. A microtask always runs before the browser's next rendering step, where it
  // captures a transition's new state; a frame callback or the observer's first callback comes
  // only after that capture in Chromium.
  const [near, setNear] = useState(true);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver !== "function") return undefined;
    const measure = () => {
      const rect = el.getBoundingClientRect();
      const h = window.innerHeight;
      return rect.bottom >= -h && rect.top <= 2 * h;
    };
    setNear(measure());
    let live = true;
    queueMicrotask(() => {
      if (live) flushSync(() => setNear(measure()));
    });
    const observer = new IntersectionObserver(
      (entries) => {
        const last = entries.at(-1);
        if (last) setNear(last.isIntersecting);
      },
      { rootMargin: "100% 0px" },
    );
    observer.observe(el);
    return () => {
      live = false;
      observer.disconnect();
    };
  }, []);
  return (
    <>
      <style>{css(n)}</style>
      {/* A grid, so the one child (a Card in a CardGrid) still fills the row's height. */}
      <div
        {...rest}
        ref={ref}
        data-morph={n}
        data-morph-near={near ? "" : undefined}
        className="grid"
      >
        {children}
      </div>
    </>
  );
}
