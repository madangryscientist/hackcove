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
 * except one that is already `absolute` and the stretched link itself.
 */
export const liftInteractive =
  "[&_:is(a,button,label,select,textarea,input,summary):not(.link-stretch):not(.absolute)]:relative [&_:is(a,button,label,select,textarea,input,summary):not(.link-stretch)]:z-10";
