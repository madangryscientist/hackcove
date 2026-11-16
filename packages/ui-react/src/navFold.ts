import { useEffect, useRef, useState } from "react";

// AppShell's `md` step: below it the nav is always in the Menu, so nothing is measured there.
const WIDE = "(width >= 48rem)";

/**
 * Whether the header row's nav is folded into the Menu: from `md`, true while the row with the nav
 * in it is wider than its box. `row` is the header row once mounted (null before, and before
 * hydration, so the header is then as it is with no script).
 *
 * Driven by the row's size alone, with no timer: while unfolded, a row that overflows folds and its
 * full width is remembered; while folded, it unfolds once the row is at least that wide. Remembering
 * the width is what stops it flipping back and forth. A browser with no `ResizeObserver` (jsdom)
 * never folds.
 */
export function useNavFold(row: HTMLElement | null, enabled: boolean): boolean {
  const [folded, setFolded] = useState(false);
  const state = useRef({ folded: false, need: 0 });
  useEffect(() => {
    if (!row || !enabled || typeof ResizeObserver === "undefined") return undefined;
    const wide = window.matchMedia(WIDE);
    const check = () => {
      if (!wide.matches) return;
      const now = state.current;
      if (!now.folded && row.scrollWidth > row.clientWidth + 1) {
        state.current = { folded: true, need: row.scrollWidth };
      } else if (now.folded && row.clientWidth >= now.need) {
        state.current = { folded: false, need: 0 };
      }
      setFolded(state.current.folded);
    };
    const observer = new ResizeObserver(check);
    observer.observe(row);
    return () => observer.disconnect();
  }, [row, enabled]);
  return enabled && folded;
}
