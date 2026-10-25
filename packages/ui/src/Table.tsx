import { Children, createContext, useContext } from "react";
import type { ComponentPropsWithoutRef, ReactElement, ReactNode } from "react";
import type { CalloutTone } from "./Callout.js";
import { cx } from "./cx.js";
import { linkClass, linkStretchClass } from "./TextLink.js";

type Align = "start" | "end";

const ALIGN: Record<Align, string> = { start: "text-left", end: "text-right" };

/**
 * The text of a cell: its weight and colour. `default`, `strong` and `muted` are the plain ones; the
 * rest are the Callout's tones, for an amount that carries a meaning (a gain, an overspend). Colour
 * alone does not say it, so a signed figure or a word says it too.
 */
export type CellTone = "default" | "strong" | "muted" | CalloutTone;

const TONE: Record<CellTone, string> = {
  default: "text-slate-700",
  strong: "font-medium text-slate-900",
  muted: "text-slate-500",
  neutral: "text-slate-600",
  info: "text-blue-700",
  positive: "text-emerald-700",
  warn: "text-amber-700",
  danger: "text-red-700",
};

type TableVariant = "card" | "plain";

/**
 * The status of a row: the Callout's tones, plus `muted`. A toned row gets a stripe on its leading
 * edge and the tone's soft fill; `muted` fades the row instead, for one that matters less. The
 * stripe takes the tone's text colour, which every theme already remaps, so no new palette entry.
 */
export type RowTone = "neutral" | "info" | "positive" | "warn" | "danger" | "muted";

const ROW_TONE: Record<RowTone, string> = {
  neutral: "bg-slate-50 text-slate-500",
  info: "bg-blue-50 text-blue-700",
  positive: "bg-emerald-50 text-emerald-700",
  warn: "bg-amber-50 text-amber-700",
  danger: "bg-red-50 text-red-700",
  muted: "opacity-60",
};
const STRIPE = "shadow-[inset_4px_0_0_0_currentColor]";

const VariantContext = createContext<TableVariant>("card");

/**
 * Whether a `TableRow` sits in the body (a line above, a hover fill), the foot (a firmer line above,
 * strong cells) or the head or nowhere (neither).
 */
const SectionContext = createContext<"head" | "body" | "foot" | undefined>(undefined);

/** What an element passes through (`data-*`, `aria-*`, `id`, …): the layout and the children stay the component's. */
type Rest<
  Tag extends "table" | "thead" | "tbody" | "tfoot" | "tr" | "th" | "td",
  Own extends string = never,
> = Omit<ComponentPropsWithoutRef<Tag>, "className" | "style" | "children" | Own>;

/**
 * The classes of the one link in a row whose hit area covers the row, so the whole row is the
 * click target. For a router's own `<Link>`; `TableRow` is the `relative` ancestor it stretches to.
 */
export const rowLinkClass = cx(linkClass, linkStretchClass);

/**
 * A list of records in a rounded, bordered card that scrolls sideways on a narrow screen. Compose it
 * from `TableHead`, `TableBody`, `TableFoot`, `TableRow`, `TableHeaderCell` and `TableCell`. `caption` names the
 * table for assistive tech and is not drawn. `variant="plain"` drops the card (its border, fill and
 * shadow), the head's tinted strip and the row hover, and keeps the row dividers; it is for a table
 * that sits inside a card of its own. Other props
 * (`id`, `data-*`, `aria-*`) go on the `<table>`.
 */
export function Table({
  caption,
  variant = "card",
  children,
  ...rest
}: {
  caption?: string | undefined;
  variant?: TableVariant | undefined;
  children: ReactNode;
} & Rest<"table">): ReactElement {
  return (
    <VariantContext.Provider value={variant}>
      <div
        className={cx(
          "overflow-x-auto",
          variant === "card" && "rounded-xl border border-slate-200/70 bg-white shadow-sm",
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
 * The `<tfoot>`: totals and subtotals. Its cells are strong by default and each row has a firmer
 * line above it, in a card and in a `plain` table alike. Put it after `TableBody`; a row of it takes
 * no `tone`.
 */
export function TableFoot({
  children,
  ...rest
}: { children: ReactNode } & Rest<"tfoot">): ReactElement {
  return (
    <tfoot {...rest}>
      <SectionContext.Provider value="foot">{children}</SectionContext.Provider>
    </tfoot>
  );
}

/**
 * A `<tr>`, `relative`: the anchor a `rowLinkClass` link stretches to. Use it in the head and the
 * body. In the body it also draws the line above the row and, unless the table is `plain`, the hover
 * fill. `tone` marks the row's status (see `RowTone`): a stripe on the leading edge and a soft fill,
 * or `muted` to fade it. A toned row keeps its fill on hover (the status stays readable), so a
 * linked row's link, not a hover fill, says it is clickable. Body rows only; colour alone does not say it, so name the status in a cell
 * too (a `Pill`). A bold subtotal is not a tone: it is a `TableFoot` row.
 */
export function TableRow({
  tone,
  children,
  ...rest
}: { tone?: RowTone | undefined; children: ReactNode } & Rest<"tr">): ReactElement {
  const section = useContext(SectionContext);
  const plain = useContext(VariantContext) === "plain";
  return (
    <tr {...rest} className={rowClass(section, plain, tone)}>
      {children}
    </tr>
  );
}

/** The classes of a row: a line above in the body and the foot, the hover fill and the tone's look in the body only. */
function rowClass(
  section: "head" | "body" | "foot" | undefined,
  plain: boolean,
  tone: RowTone | undefined,
): string {
  if (section === "foot") return "relative border-t border-slate-300";
  if (section !== "body") return "relative";
  const line = "relative border-t border-slate-200/70";
  const hover = !plain && "hover:bg-slate-50";
  if (tone === undefined) return cx(line, hover);
  if (tone === "muted") return cx(line, hover, ROW_TONE.muted);
  return cx(line, ROW_TONE[tone], STRIPE);
}

/**
 * A full-width group header in the body: a tinted row with a `label` that spans the table's
 * `colSpan` columns (its real column count), and optional `trailing` content at the far end (a
 * count, a subtotal, a small button). The group's rows follow it. For a panel of other content across the whole row, use a `TableCell` with
 * `colSpan` instead.
 */
export function TableGroupRow({
  label,
  trailing,
  colSpan,
  ...rest
}: { label: ReactNode; trailing?: ReactNode; colSpan: number } & Rest<"tr">): ReactElement {
  return (
    <tr {...rest} className="relative border-t border-slate-200/70 bg-slate-50">
      <th scope="rowgroup" colSpan={colSpan} className="px-4 py-2 text-left text-sm">
        <div className="flex items-center justify-between gap-3">
          <span className="font-medium text-slate-900">{label}</span>
          {trailing != null && trailing !== false && (
            <span className="shrink-0 font-normal text-slate-500">{trailing}</span>
          )}
        </div>
      </th>
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

/** The widest a `truncate` cell grows. */
const TRUNCATE_WIDTH = "max-w-xs";

/**
 * A `<td>`. `tone` is the text weight and colour (see `CellTone`; in a `TableFoot` it defaults to
 * `strong`); `numeric` sets tabular figures, `mono` a small mono face. `secondary` is a second,
 * muted line under the content. One rule for wrapping: prose wraps onto more lines (never narrower
 * than `min-w-48`, so it scrolls the table before it becomes a sliver), and a `numeric` or `mono`
 * cell (a figure, a code, a type) never breaks. `truncate` caps a long value's width, cuts it with
 * an ellipsis on one line and puts the full text in a `title`; the content is then plain text (strings and
 * numbers), since that is what the title shows. `colSpan` passes through: a cell that
 * spans the row is a full-width panel (an empty state, a note under a group).
 */
export function TableCell({
  align = "start",
  tone,
  numeric = false,
  mono = false,
  truncate = false,
  secondary,
  children,
  ...rest
}: {
  align?: Align | undefined;
  tone?: CellTone | undefined;
  numeric?: boolean | undefined;
  mono?: boolean | undefined;
  truncate?: boolean | undefined;
  secondary?: ReactNode;
  children?: ReactNode;
} & Rest<"td", "align">): ReactElement {
  const foot = useContext(SectionContext) === "foot";
  return (
    <td {...rest} className={cellClass({ align, tone, foot, numeric, mono })}>
      <CellBody align={align} truncate={truncate} secondary={secondary}>
        {children}
      </CellBody>
    </td>
  );
}

/** The classes of a cell: the tone (`strong` by default in a foot, and a foot's cells are medium whatever the tone), then the wrapping rule. */
function cellClass({
  align,
  tone,
  foot,
  numeric,
  mono,
}: {
  align: Align;
  tone: CellTone | undefined;
  foot: boolean;
  numeric: boolean;
  mono: boolean;
}): string {
  const resolved = tone ?? (foot ? "strong" : "default");
  return cx(
    "px-4 py-3",
    ALIGN[align],
    TONE[resolved],
    foot && resolved !== "strong" && "font-medium",
    figureClass(numeric, mono),
  );
}

const isText = (node: unknown): node is string | number =>
  typeof node === "string" || typeof node === "number";

/** What a cell holds: the content, cut to one line with its full text in a `title` when `truncate`, then the `secondary` line. */
function CellBody({
  align,
  truncate,
  secondary,
  children,
}: {
  align: Align;
  truncate: boolean;
  secondary: ReactNode;
  children: ReactNode;
}): ReactElement {
  const parts = Children.toArray(children);
  const text = parts.every(isText) ? parts.join("") : undefined;
  return (
    <>
      {truncate ? (
        <div className={cx(TRUNCATE_WIDTH, "truncate", align === "end" && "ml-auto")} title={text}>
          {children}
        </div>
      ) : (
        children
      )}
      {secondary != null && secondary !== false && (
        <div className="text-xs font-normal text-slate-500">{secondary}</div>
      )}
    </>
  );
}
