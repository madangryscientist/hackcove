import type { HTMLAttributes, ReactElement, ReactNode } from "react";
import type { Unstyled } from "./props.js";

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
const css = (n: string): string =>
  `[data-morph="${n}"]{view-transition-name:${n}}
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
 * this element morphs. A `view-transition-name` makes the div a stacking context, so a dropdown
 * inside it cannot rise above a sticky header outside it: portal overlays to the body. Under
 * `prefers-reduced-motion: reduce` it swaps with no animation; a router's own transition of the
 * rest of the page is the router's to quiet.
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
} & Unstyled<HTMLAttributes<HTMLDivElement>>): ReactElement {
  const n = morphName(name, item);
  return (
    <>
      <style>{css(n)}</style>
      {/* A grid, so the one child (a Card in a CardGrid) still fills the row's height. */}
      <div {...rest} data-morph={n} className="grid">
        {children}
      </div>
    </>
  );
}
