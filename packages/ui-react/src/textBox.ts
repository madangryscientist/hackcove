import { cx } from "./cx.js";

/** Where a run of text sits across its block. */
export type TextAlign = "start" | "center" | "end";

/** How many lines a clamped run shows before it ends in an ellipsis. */
export type TextLines = 1 | 2 | 3 | 4;

const ALIGN: Record<TextAlign, string> = {
  start: "text-start",
  center: "text-center",
  end: "text-end",
};

/** A run clamped to 2, 3 or 4 lines: `line-clamp` is a box of its own. */
const CLAMP: Record<Exclude<TextLines, 1>, string> = {
  2: "line-clamp-2",
  3: "line-clamp-3",
  4: "line-clamp-4",
};

/**
 * The alignment, and the box it needs. An aligned run is block-level, so text-align has a box to set
 * the text in. A run cut to one line clips: inline-block by default, a block when it is aligned too.
 * Internal to the typography roles.
 */
export function layoutClass(align: TextAlign | undefined, lines: TextLines | undefined): string {
  const box =
    lines === 1
      ? cx("min-w-0 truncate align-bottom", align ? "block" : "inline-block")
      : (lines && CLAMP[lines]) || (align && "block");
  return cx(align && ALIGN[align], box);
}
