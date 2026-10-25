import type { ReactElement, ReactNode } from "react";
import { cx } from "./cx.js";
import { linkClass, linkStretchClass } from "./TextLink.js";

type Align = "start" | "end";

const ALIGN: Record<Align, string> = { start: "text-left", end: "text-right" };

const TONE = {
  default: "text-slate-700",
  strong: "font-medium text-slate-900",
  muted: "text-slate-500",
} as const;

/**
 * The classes of the one link in a row whose hit area covers the row, so the whole row is the
 * click target. For a router's own `<Link>`; `TableRow` is the `relative` ancestor it stretches to.
 */
export const rowLinkClass = cx(linkClass, linkStretchClass);

/**
 * A list of records in a rounded, bordered card that scrolls sideways on a narrow screen. Compose it
 * from `TableHead`, `TableBody`, `TableRow`, `TableHeaderCell` and `TableCell`. `caption` names the
 * table for assistive tech and is not drawn.
 */
export function Table({
  caption,
  className,
  children,
}: {
  caption?: string | undefined;
  className?: string | undefined;
  children: ReactNode;
}): ReactElement {
  return (
    <div
      className={cx(
        "overflow-x-auto rounded-xl border border-slate-200/70 bg-white shadow-sm",
        className,
      )}
    >
      <table className="w-full text-left text-sm">
        {caption && <caption className="sr-only">{caption}</caption>}
        {children}
      </table>
    </div>
  );
}

/** The `<thead>`: small uppercase column titles on a tinted strip. Holds one `TableRow` of `TableHeaderCell`s. */
export function TableHead({ children }: { children: ReactNode }): ReactElement {
  return (
    <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">{children}</thead>
  );
}

/** The `<tbody>`: the rows, each with a line above it and a fill on hover. */
export function TableBody({ children }: { children: ReactNode }): ReactElement {
  return (
    <tbody className="[&>tr:hover]:bg-slate-50 [&>tr]:border-t [&>tr]:border-slate-200/70">
      {children}
    </tbody>
  );
}

/** A `<tr>`, `relative`: the anchor a `rowLinkClass` link stretches to. Use it in the head and the body. */
export function TableRow({ children }: { children: ReactNode }): ReactElement {
  return <tr className="relative">{children}</tr>;
}

/** A column title, `<th scope="col">`. */
export function TableHeaderCell({
  align = "start",
  children,
}: {
  align?: Align | undefined;
  children?: ReactNode;
}): ReactElement {
  return (
    <th scope="col" className={cx("whitespace-nowrap px-4 py-2.5 font-medium", ALIGN[align])}>
      {children}
    </th>
  );
}

/** A `<td>`. `tone` is the text weight and colour; `numeric` sets tabular figures, `mono` a small mono face. */
export function TableCell({
  align = "start",
  tone = "default",
  numeric = false,
  mono = false,
  children,
}: {
  align?: Align | undefined;
  tone?: keyof typeof TONE | undefined;
  numeric?: boolean | undefined;
  mono?: boolean | undefined;
  children?: ReactNode;
}): ReactElement {
  return (
    <td
      className={cx(
        "whitespace-nowrap px-4 py-3",
        ALIGN[align],
        TONE[tone],
        numeric && "tabular-nums",
        mono && "font-mono text-xs",
      )}
    >
      {children}
    </td>
  );
}
