import { createContext, useContext } from "react";
import type { ComponentPropsWithoutRef, ReactElement, ReactNode } from "react";
import { cx } from "./cx.js";
import { linkClass, linkStretchClass } from "./TextLink.js";

type Align = "start" | "end";

const ALIGN: Record<Align, string> = { start: "text-left", end: "text-right" };

const TONE = {
  default: "text-slate-700",
  strong: "font-medium text-slate-900",
  muted: "text-slate-500",
} as const;

type TableVariant = "card" | "plain";

const VariantContext = createContext<TableVariant>("card");

/** Whether a `TableRow` sits in the body (a line above, a hover fill) or the head or nowhere (neither). */
const SectionContext = createContext<"head" | "body" | undefined>(undefined);

/** What an element passes through (`data-*`, `aria-*`, `id`, …): the layout and the children stay the component's. */
type Rest<
  Tag extends "table" | "thead" | "tbody" | "tr" | "th" | "td",
  Own extends string = never,
> = Omit<ComponentPropsWithoutRef<Tag>, "className" | "style" | "children" | Own>;

/**
 * The classes of the one link in a row whose hit area covers the row, so the whole row is the
 * click target. For a router's own `<Link>`; `TableRow` is the `relative` ancestor it stretches to.
 */
export const rowLinkClass = cx(linkClass, linkStretchClass);

/**
 * A list of records in a rounded, bordered card that scrolls sideways on a narrow screen. Compose it
 * from `TableHead`, `TableBody`, `TableRow`, `TableHeaderCell` and `TableCell`. `caption` names the
 * table for assistive tech and is not drawn. `variant="plain"` drops the card (its border, fill and
 * shadow), the head's tinted strip and the row hover, and keeps the row dividers; it is for a table
 * that sits inside a card of its own. `className` goes on the scrolling wrapper; the other props
 * (`id`, `data-*`, `aria-*`) on the `<table>`.
 */
export function Table({
  caption,
  variant = "card",
  className,
  children,
  ...rest
}: {
  caption?: string | undefined;
  variant?: TableVariant | undefined;
  className?: string | undefined;
  children: ReactNode;
} & Rest<"table">): ReactElement {
  return (
    <VariantContext.Provider value={variant}>
      <div
        className={cx(
          "overflow-x-auto",
          variant === "card" && "rounded-xl border border-slate-200/70 bg-white shadow-sm",
          className,
        )}
      >
        <table {...rest} className="w-full text-left text-sm">
          {caption && <caption className="sr-only">{caption}</caption>}
          {children}
        </table>
      </div>
    </VariantContext.Provider>
  );
}

/** The `<thead>`: small uppercase column titles, on a tinted strip unless the table is `plain`. Holds one `TableRow` of `TableHeaderCell`s. */
export function TableHead({
  children,
  ...rest
}: { children: ReactNode } & Rest<"thead">): ReactElement {
  const plain = useContext(VariantContext) === "plain";
  return (
    <thead
      {...rest}
      className={cx("text-xs uppercase tracking-wide text-slate-500", !plain && "bg-slate-50")}
    >
      <SectionContext.Provider value="head">{children}</SectionContext.Provider>
    </thead>
  );
}

/** The `<tbody>`: the rows, each with a line above it and, unless the table is `plain`, a fill on hover. */
export function TableBody({
  children,
  ...rest
}: { children: ReactNode } & Rest<"tbody">): ReactElement {
  return (
    <tbody {...rest}>
      <SectionContext.Provider value="body">{children}</SectionContext.Provider>
    </tbody>
  );
}

/**
 * A `<tr>`, `relative`: the anchor a `rowLinkClass` link stretches to. Use it in the head and the
 * body. In the body it also draws the line above the row and, unless the table is `plain`, the hover fill.
 */
export function TableRow({
  children,
  ...rest
}: { children: ReactNode } & Rest<"tr">): ReactElement {
  const body = useContext(SectionContext) === "body";
  const plain = useContext(VariantContext) === "plain";
  return (
    <tr
      {...rest}
      className={cx(
        "relative",
        body && "border-t border-slate-200/70",
        body && !plain && "hover:bg-slate-50",
      )}
    >
      {children}
    </tr>
  );
}

/** A column title, `<th scope="col">`. */
export function TableHeaderCell({
  align = "start",
  children,
  ...rest
}: {
  align?: Align | undefined;
  children?: ReactNode;
} & Rest<"th", "align" | "scope">): ReactElement {
  return (
    <th
      {...rest}
      scope="col"
      className={cx("whitespace-nowrap px-4 py-2.5 font-medium", ALIGN[align])}
    >
      {children}
    </th>
  );
}

/** The wrapping rule: a figure or code never breaks; prose wraps, down to `min-w-48`. */
function figureClass(numeric: boolean, mono: boolean): string {
  if (!numeric && !mono) return "min-w-48";
  return cx("whitespace-nowrap", numeric && "tabular-nums", mono && "font-mono text-xs");
}

/**
 * A `<td>`. `tone` is the text weight and colour; `numeric` sets tabular figures, `mono` a small mono
 * face. `secondary` is a second, muted line under the content. One rule for wrapping: prose wraps
 * onto more lines (never narrower than `min-w-48`, so it scrolls the table before it becomes a sliver), and a `numeric` or `mono` cell (a figure, a code, a type) never breaks.
 */
export function TableCell({
  align = "start",
  tone = "default",
  numeric = false,
  mono = false,
  secondary,
  children,
  ...rest
}: {
  align?: Align | undefined;
  tone?: keyof typeof TONE | undefined;
  numeric?: boolean | undefined;
  mono?: boolean | undefined;
  secondary?: ReactNode;
  children?: ReactNode;
} & Rest<"td", "align">): ReactElement {
  return (
    <td {...rest} className={cx("px-4 py-3", ALIGN[align], TONE[tone], figureClass(numeric, mono))}>
      {children}
      {secondary != null && secondary !== false && (
        <div className="text-xs font-normal text-slate-500">{secondary}</div>
      )}
    </td>
  );
}
