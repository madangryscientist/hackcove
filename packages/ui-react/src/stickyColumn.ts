/**
 * A column that stays in view as the page scrolls (`SidebarLayout`'s rail from `md`, `DetailLayout`'s
 * aside from `lg` when asked). The `<aside>` sticks directly under AppShell's header (`--app-header`,
 * as `StickyBar` does; 0 outside a shell) and is as tall as its content. A sticky `top` also pushes a
 * column that starts above it down, so it is exactly the header and no gap: a gap would move a rail
 * rendered at the top of its box. Inside it the scroller is capped at the viewport less the header
 * and 2rem (the room the Container's `py-8` leaves at the page's end, so the column is never pushed
 * up under the header there), so a column taller than that scrolls itself and its end stays
 * reachable. `overflow` clips, which would cut a keyboard focus ring (an outline 4px out) at the
 * scroller's edges, so it is padded 4px (`p-1`) and pulled back out by the same (`-m-1`): the ring
 * has room and the column stays on the page's edges. Each variant is written out whole, so Tailwind
 * sees every class.
 */
export const STICKY_ASIDE_MD = "md:sticky md:top-[var(--app-header,0px)] md:self-start";
export const STICKY_SCROLL_MD =
  "md:-m-1 md:max-h-[calc(100dvh-var(--app-header,0px)-2rem)] md:overflow-y-auto md:p-1";
export const STICKY_ASIDE_LG = "lg:sticky lg:top-[var(--app-header,0px)] lg:self-start";
export const STICKY_SCROLL_LG =
  "lg:-m-1 lg:max-h-[calc(100dvh-var(--app-header,0px)-2rem)] lg:overflow-y-auto lg:p-1";

/**
 * While a sticky column's scroller has more to scroll to on a side, that edge fades out (a mask, so
 * it follows any theme), the way AppShell's header row does. `useScrollEdges` sets `data-more-start`
 * / `data-more-end` (and `data-more` for either); a column that fits has none and is untouched.
 * Each is prefixed with its breakpoint, below which the column neither sticks nor scrolls and gets
 * no mask. While the scroller itself holds the keyboard's tab stop (`focus-visible`) the mask is
 * off, since it would hide the focus ring (an outline) at the faded edges.
 */
export const STICKY_FADE_MD =
  "md:data-more-start:[--fade-start:1.5rem] md:data-more-end:[--fade-end:1.5rem] md:data-more:[mask-image:linear-gradient(to_bottom,transparent,#000_var(--fade-start,0px),#000_calc(100%_-_var(--fade-end,0px)),transparent)] md:data-more:focus-visible:[mask-image:none]";
export const STICKY_FADE_LG =
  "lg:data-more-start:[--fade-start:1.5rem] lg:data-more-end:[--fade-end:1.5rem] lg:data-more:[mask-image:linear-gradient(to_bottom,transparent,#000_var(--fade-start,0px),#000_calc(100%_-_var(--fade-end,0px)),transparent)] lg:data-more:focus-visible:[mask-image:none]";
