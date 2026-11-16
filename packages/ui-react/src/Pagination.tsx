import type { ReactElement } from "react";
import { blockedButtonClass, buttonClass } from "./Button.js";
import { cx } from "./cx.js";
import { type TypeStep, useTypeStep } from "./density.js";
import { renderLink } from "./link.js";
import type { Passthrough } from "./props.js";
import { pillTabClass } from "./Tabs.js";

/** The most slots the number row holds, so it keeps one width as the page moves. */
const SLOTS = 7;

/** `page` moved into `1` to `pageCount`, so a stale `?page=9` of 4 draws page 4. */
function clamp(page: number, pageCount: number): number {
  return Math.min(Math.max(page, 1), pageCount);
}

/** The pages `from` to `to`, both included. */
function range(from: number, to: number): number[] {
  return Array.from({ length: to - from + 1 }, (_, index) => from + index);
}

/**
 * The slots of the number row: always the first and the last page, the current page and its two
 * neighbours, and a gap for a run of two or more hidden pages. A gap never hides a single page,
 * and the row never holds more than seven slots. Page 1 of 20 is `1 2 3 4 5 … 20`, page 10 is
 * `1 … 9 10 11 … 20`.
 */
export function pageWindow(page: number, pageCount: number): Array<number | "gap"> {
  if (pageCount <= SLOTS) return range(1, pageCount);
  const at = clamp(page, pageCount);
  if (at <= 4) return [...range(1, 5), "gap", pageCount];
  if (at >= pageCount - 3) return [1, "gap", ...range(pageCount - 4, pageCount)];
  return [1, "gap", at - 1, at, at + 1, "gap", pageCount];
}

/** Previous or Next: a link in the outline look, or the same box as plain text at the edge. */
function Edge({
  to,
  pageCount,
  pageHref,
  rel,
  step,
  children,
}: {
  to: number;
  pageCount: number;
  pageHref: (page: number) => string;
  rel: "prev" | "next";
  step: TypeStep | undefined;
  children: string;
}): ReactElement {
  if (to < 1 || to > pageCount) {
    // Not a link: no dead stop in the tab order, and the row does not jump.
    return <span className={blockedButtonClass("outline", { size: "sm" }, step)}>{children}</span>;
  }
  return renderLink({
    href: pageHref(to),
    rel,
    className: buttonClass("outline", { size: "sm" }, step),
    children,
  });
}

/**
 * Page links for a long list: Previous, the page numbers and Next, in a `<nav>` named by `label`.
 * Each is a link to `pageHref(page)`, drawn by the app's router link through `LinkProvider`, so the
 * page lives in the URL and back, a new tab and a shared link all work. The current page is a link
 * with `aria-current="page"`. Below `sm` the numbers give way to `pageLabel` ("Page 2 of 4").
 * Renders nothing for one page. The count line ("21 to 40 of 312") is the caller's `Caption`.
 */
export function Pagination({
  label,
  page,
  pageCount,
  pageHref,
  previousLabel = "Previous",
  nextLabel = "Next",
  pageLabel = (at, count) => `Page ${at} of ${count}`,
  ...rest
}: {
  /** Names the `<nav>`. Two pagers on a page (above and below a list) each need their own. */
  label: string;
  /** The page shown, from 1. Drawn clamped into `1` to `pageCount`. */
  page: number;
  /** How many pages there are. One or none draws nothing. */
  pageCount: number;
  /** The URL of one page, called for every link drawn: `(page) => (page > 1 ? `?page=${page}` : "?")`. */
  pageHref: (page: number) => string;
  /**
   * The previous-page link's text.
   * @default Previous
   */
  previousLabel?: string | undefined;
  /**
   * The next-page link's text.
   * @default Next
   */
  nextLabel?: string | undefined;
  /** The summary shown in place of the numbers below `sm`. Default: `Page 2 of 4`. */
  pageLabel?: ((page: number, pageCount: number) => string) | undefined;
} & Passthrough): ReactElement | null {
  const step = useTypeStep();
  if (pageCount <= 1) return null;
  const at = clamp(page, pageCount);
  const edge = { pageCount, pageHref, step };
  return (
    <nav {...rest} aria-label={label}>
      <div className="flex items-center gap-1">
        <Edge to={at - 1} rel="prev" {...edge}>
          {previousLabel}
        </Edge>
        <ol className="hidden items-center gap-1 sm:flex">
          {pageWindow(at, pageCount).map((slot, index) =>
            slot === "gap" ? (
              <li key={`gap-${index}`} aria-hidden="true" className="px-1 text-sm text-slate-400">
                …
              </li>
            ) : (
              <li key={slot}>
                {renderLink({
                  href: pageHref(slot),
                  "aria-current": slot === at ? "page" : undefined,
                  className: cx(
                    pillTabClass(slot === at, false, "sm", step),
                    "inline-flex min-w-8 justify-center tabular-nums",
                  ),
                  children: slot,
                })}
              </li>
            ),
          )}
        </ol>
        <span className="px-2 text-sm text-slate-600 tabular-nums sm:hidden">
          {pageLabel(at, pageCount)}
        </span>
        <Edge to={at + 1} rel="next" {...edge}>
          {nextLabel}
        </Edge>
      </div>
    </nav>
  );
}
