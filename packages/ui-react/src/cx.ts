/** Join class names, dropping falsy parts. */
export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

/** The keyboard focus ring every interactive control shares. */
export const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-600";

/**
 * On a row or card that holds a stretched link (`link-stretch`): every interactive descendant sits
 * above that link and is clickable on its own. `z-10` needs a position, so each gets `relative`,
 * except one that is already `absolute` and the stretched link itself. The row or card is `isolate`,
 * its own stacking context: its `z-10` descendants rank only inside it, so they cannot tie with or
 * paint over the page's sticky bars (AppShell's header, a StickyBar).
 */
export const liftInteractive =
  "isolate [&_:is(a,button,label,select,textarea,input,summary):not(.link-stretch):not(.absolute)]:relative [&_:is(a,button,label,select,textarea,input,summary):not(.link-stretch)]:z-10";

/**
 * A thin scrollbar in the theme's muted ink instead of the heavy native one, for a box that
 * scrolls sideways (code). `scrollbar-color` takes no Tailwind colour utility, so the thumb is the
 * element's own text colour (`currentColor`, a palette utility every theme remaps) and the track is
 * transparent. The element must not hold text of its own: put the readable colour on an inner box.
 */
export const themedScrollbar =
  "text-slate-400 [scrollbar-width:thin] [scrollbar-color:currentColor_transparent]";
