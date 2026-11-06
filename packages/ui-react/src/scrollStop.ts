import { type HTMLAttributes, useEffect, useState } from "react";
import { focusRing } from "./cx.js";

/** Anything the keyboard can reach on its own. */
export const TABBABLE =
  ':is(a[href], button, input:not([type="hidden"]), select, textarea, summary, iframe, audio[controls], video[controls], [contenteditable]:not([contenteditable="false"]), [tabindex]):not([disabled], [tabindex="-1"])';

/** Whether something in `scroller` is on screen and reachable by the keyboard. */
function holdsTabbable(scroller: HTMLElement): boolean {
  for (const el of scroller.querySelectorAll<HTMLElement>(TABBABLE)) {
    // A `display: none` summary (a folded column's, from its breakpoint up) is not a tab stop.
    // jsdom (a consumer's own tests) has no `checkVisibility`; there everything counts.
    if (typeof el.checkVisibility !== "function" || el.checkVisibility()) return true;
  }
  return false;
}

/**
 * The keyboard side of a box that scrolls (a `Dialog`'s body, a sticky column): a box that
 * overflows and holds nothing the keyboard can reach has no way to be scrolled from the keyboard,
 * so it takes a tab stop (axe's `scrollable-region-focusable`). A box that holds a link, a field or
 * a button needs none: the keyboard scrolls it by moving focus inside. `attach` is the box's `ref`;
 * `element` is the box once it is mounted; `stop` is whether it takes the tab stop. Attach it to
 * nothing and `stop` stays false.
 */
export function useScrollStop(): {
  element: HTMLElement | null;
  attach: (el: HTMLDivElement | null) => void;
  stop: boolean;
} {
  const [element, setElement] = useState<HTMLElement | null>(null);
  const [stop, setStop] = useState(false);

  useEffect(() => {
    // jsdom (a consumer's own tests) has no ResizeObserver.
    if (!element || typeof ResizeObserver === "undefined") return undefined;
    const measure = () =>
      setStop(element.scrollHeight > element.clientHeight && !holdsTabbable(element));
    // Each observer reports once when it starts, and again when the box is resized, its content
    // changes or something in it becomes (un)reachable by the keyboard.
    const resize = new ResizeObserver(measure);
    resize.observe(element);
    for (const child of element.children) resize.observe(child);
    const change = new MutationObserver(measure);
    change.observe(element, {
      childList: true,
      subtree: true,
      characterData: true,
      attributeFilter: ["disabled", "tabindex", "href", "type", "contenteditable", "open"],
    });
    return () => {
      resize.disconnect();
      change.disconnect();
    };
  }, [element]);

  return { element, attach: setElement, stop: stop && element !== null };
}

/**
 * The props a scroller takes while it holds the tab stop: focusable, ringed and, when the column
 * has a name, a group of that name so a screen reader says what the stop is. Nothing otherwise.
 */
export function scrollStopProps(
  stop: boolean,
  name: { label?: string | undefined; labelledBy?: string | undefined } = {},
): { props: HTMLAttributes<HTMLDivElement>; ring: string } {
  if (!stop) return { props: {}, ring: "" };
  const named = name.label !== undefined || name.labelledBy !== undefined;
  return {
    props: {
      tabIndex: 0,
      ...(named ? { role: "group" } : {}),
      ...(name.label !== undefined ? { "aria-label": name.label } : {}),
      ...(name.labelledBy !== undefined ? { "aria-labelledby": name.labelledBy } : {}),
    },
    ring: focusRing,
  };
}
