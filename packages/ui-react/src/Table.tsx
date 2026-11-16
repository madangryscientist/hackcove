import { Children, createContext, useContext } from "react";
import type { ComponentPropsWithoutRef, ReactElement, ReactNode } from "react";
import { useInCard } from "./cardContext.js";
import { cx } from "./cx.js";
import { DensityProvider } from "./density.js";
import type { Size } from "./size.js";
import { hasNoChildren } from "./emptySlot.js";
import {
  columnCount,
  numericColumns,
  TableContext,
  useNumericColumn,
  withColumns,
} from "./tableColumns.js";
import type { Tone } from "./tone.js";
import { type RowMark, rowClass, SELECTED, BODY_LINE, PAD } from "./tableRow.js";
import { EmptyRow } from "./tableEmpty.js";
import { TEXT_TONE } from "./typography.js";

type Align = "start" | "center" | "end";

const ALIGN: Record<Align, string> = {
  start: "text-left",
  center: "text-center",
  end: "text-right",
};

/**
 * The text of a cell: its weight and colour. `neutral` (the default), `strong` and `muted` are the
 * plain ones; the rest are the shared tones, for an amount that carries a meaning (a gain, an
 * overspend). Colour alone does not say it, so a signed figure or a word says it too.
 */
export type CellTone = "strong" | "muted" | Tone;

const TONE: Record<CellTone, string> = {
  strong: "font-medium text-slate-900",
  neutral: "text-slate-700",
  ...TEXT_TONE,
};

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
 * A list of records in a rounded, bordered card that scrolls sideways on a narrow screen. Compose it
 * from `TableHead`, `TableBody`, `TableFoot`, `TableRow`, `TableHeaderCell` and `TableCell`. `label`
 * names the table for assistive tech and is not drawn. Inside a `Card` it is plain: no card of its
 * own (border, fill and shadow), no tinted head strip and no row hover, only the row dividers. A
 * column of figures says so once, with `numeric` on its `TableHeaderCell`: its cells then take end
 * alignment and tabular figures. `size` is the row padding, and the controls in the rows follow it
 * (`sm` by default). Other props (`id`, `data-*`, `aria-*`) go on the `<table>`.
 */
export function Table({
  label,
  size = "sm",
  children,
  ...rest
}: {
  /** Names the table for assistive tech; it is not drawn. */
  label: string;
  /**
   * The row padding; the buttons and fields in the rows take the same size.
   * @default sm
   */
  size?: Size | undefined;
  children: ReactNode;
} & Rest<"table">): ReactElement {
  const plain = useInCard();
  const numeric = numericColumns(children, TableHead, TableRow);
  const columns = columnCount(children, TableHead, TableRow);
  return (
    <TableContext.Provider value={{ plain, size, numeric, columns }}>
      <DensityProvider size={size}>
        <div
          className={cx(
            "overflow-x-auto",
            !plain && "rounded-xl border border-slate-200/70 bg-white shadow-sm",
          )}
        >
          <table {...rest} className="w-full text-left text-sm">
            <caption className="sr-only">{label}</caption>
            {children}
          </table>
        </div>
      </DensityProvider>
    </TableContext.Provider>
  );
}

/** The `<thead>`: small uppercase column titles, on a tinted strip unless the table is in a card. Holds one `TableRow` of `TableHeaderCell`s. */
export function TableHead({
  children,
  ...rest
}: { children: ReactNode } & Rest<"thead">): ReactElement {
  const { plain } = useContext(TableContext);
  return (
    <thead
      {...rest}
      className={cx("text-xs uppercase tracking-wide text-slate-500", !plain && "bg-slate-50")}
    >
      <SectionContext.Provider value="head">{children}</SectionContext.Provider>
    </thead>
  );
}

/**
 * The `<tbody>`: the rows, each with a line above it and, unless the table is in a card, a fill on
 * hover. With no rows it draws `empty` (an `EmptyState`, one muted line here) in one cell that spans
 * every column the head declares; the head stays drawn, so the reader sees what the table holds.
 */
export function TableBody({
  empty,
  children,
  ...rest
}: {
  /** Shown in one full-width cell when there are no rows: an `EmptyState`. */
  empty?: ReactNode;
  children?: ReactNode;
} & Rest<"tbody">): ReactElement {
  return (
    <tbody {...rest}>
      {hasNoChildren(children) && empty != null ? (
        <EmptyRow>{empty}</EmptyRow>
      ) : (
        <SectionContext.Provider value="body">{children}</SectionContext.Provider>
      )}
    </tbody>
  );
}

/**
 * The `<tfoot>`: totals and subtotals. Its cells are strong by default and each row has a firmer
 * line above it, alone and in a card alike. Put it after `TableBody`; a row of it takes
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
 * A `<tr>`, `relative`: the anchor a `TextLink stretch` (with `href`) stretches to. Any other link, button or
 * control in the row (a `TextLink`, a `Button`, a `Checkbox`) sits above that link and is clickable
 * on its own, with no class from the caller. Use it in the head and the
 * body. In the body it also draws the line above the row and, unless the table is in a card, the hover
 * fill. `selected` marks the current row (the one open beside the table, the one being edited): the
 * `ListRow` selected fill and `aria-selected`; it wins over `tone` and `stripe`. `tone` marks the row's status (see `RowTone`): a stripe on the leading edge and a soft fill,
 * or `muted` to fade it. A toned row keeps its fill on hover (the status stays readable), so a
 * linked row's link, not a hover fill, says it is clickable. `stripe` is the stripe alone, in the
 * `TextTone` colours (the first five names of a `StackedBar` segment's `VizTone`), with no fill: the row keeps its hover
 * and its own look. Give `tone` or `stripe`, not both. Body rows only; colour alone does not say it,
 * so name the status in a cell too (a `Pill`). A bold subtotal is not a tone: a total of the whole
 * table is a `TableFoot` row, and a subtotal among the body's rows is `emphasis`, the same look.
 */
export function TableRow({
  tone,
  stripe,
  emphasis = false,
  selected = false,
  children,
  ...rest
}: RowMark & {
  /** The current row: the selected fill and `aria-selected`. Body rows only. */
  selected?: boolean | undefined;
  children: ReactNode;
} & Rest<"tr">): ReactElement {
  const outer = useContext(SectionContext);
  const { plain } = useContext(TableContext);
  const section = emphasis && outer === "body" ? "foot" : outer;
  const current = selected && section === "body";
  return (
    <SectionContext.Provider value={section}>
      <tr
        {...rest}
        {...(current ? { "aria-selected": true } : {})}
        className={current ? cx(BODY_LINE, SELECTED) : rowClass(section, plain, tone, stripe)}
      >
        {withColumns(children)}
      </tr>
    </SectionContext.Provider>
  );
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
}: {
  /** The group's name, at the start of the row. */
  label: ReactNode;
  /** Content at the far end of the row: a count, a subtotal, a small button. */
  trailing?: ReactNode;
  /** The table's real column count, so the header spans the whole row. */
  colSpan: number;
} & Rest<"tr">): ReactElement {
  const { size } = useContext(TableContext);
  return (
    <tr {...rest} className="relative border-t border-slate-200/70 bg-slate-50">
      <th scope="rowgroup" colSpan={colSpan} className={cx(PAD[size].group, "text-left text-sm")}>
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

/**
 * A column title, `<th scope="col">`. `numeric` declares a column of figures, once: the title and
 * every cell under it take end alignment and tabular figures. A column with nothing to show in its
 * head (a row's actions) takes `label` instead of `children`: the name a screen reader hears
 * ("Actions"), visually hidden so the head keeps its column.
 */
export function TableHeaderCell({
  numeric = false,
  align = numeric ? "end" : "start",
  children,
  label,
  ...rest
}: {
  /** A column of figures: this title and the cells under it are end aligned, the cells in tabular figures. */
  numeric?: boolean | undefined;
  /**
   * The title's horizontal alignment; `end` over a column of buttons, `center` over a centred column.
   * @default end for a numeric column, else start
   */
  align?: Align | undefined;
} & (
  | { children?: ReactNode; label?: undefined }
  | {
      children?: undefined;
      /** The column's name for a screen reader, visually hidden, for a column with no visible title (a row's actions). */
      label: string;
    }
) &
  Rest<"th", "align" | "scope">): ReactElement {
  const { size } = useContext(TableContext);
  return (
    <th
      {...rest}
      scope="col"
      className={cx("whitespace-nowrap font-medium", PAD[size].head, ALIGN[align])}
    >
      {label === undefined ? children : <span className="sr-only">{label}</span>}
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

/** Where a `truncate` cell's capped box sits, so it follows the cell's alignment. */
const TRUNCATE_ALIGN: Record<Align, string | undefined> = {
  start: undefined,
  center: "mx-auto",
  end: "ml-auto",
};

/** A step of a hierarchy under a row: the cell's own start padding plus 1rem a level. */
type Indent = 1 | 2 | 3;

const INDENT: Record<Size, Record<Indent, string>> = {
  sm: { 1: "pl-8", 2: "pl-12", 3: "pl-16" },
  md: { 1: "pl-9", 2: "pl-13", 3: "pl-17" },
  lg: { 1: "pl-10", 2: "pl-14", 3: "pl-18" },
};

/**
 * A `<td>`. `tone` is the text weight and colour (see `CellTone`; in a `TableFoot` it defaults to
 * `strong`); `numeric` sets end alignment and tabular figures (a cell under a `numeric` head cell is
 * numeric already), `mono` a small mono face. `secondary` is a second,
 * muted line under the content. One rule for wrapping: prose wraps onto more lines (never narrower
 * than `min-w-48`, so it scrolls the table before it becomes a sliver), and a `numeric` or `mono`
 * cell (a figure, a code, a type) never breaks. `truncate` caps a long value's width, cuts it with
 * an ellipsis on one line and puts the full text in a `title`; the content is then plain text (strings and
 * numbers), since that is what the title shows. `colSpan` passes through: a cell that
 * spans the row is a full-width panel (a note under a group), and `align="center"` centres it. A
 * table with no rows takes `TableBody empty`, not a cell built by hand. `indent` sets a start-aligned cell in by 1 to 3 levels, for a line under a parent row.
 */
export function TableCell({
  align,
  tone,
  numeric,
  mono = false,
  truncate = false,
  indent,
  secondary,
  children,
  ...rest
}: {
  /**
   * The cell's horizontal alignment; `center` for a full-width note.
   * @default end for a numeric cell, else start
   */
  align?: Align | undefined;
  /** Sets the cell in by this many levels (1 to 3), for a line under a parent row. Start-aligned cells only. */
  indent?: Indent | undefined;
  /** The text weight and colour (see `CellTone`). In a `TableFoot` it defaults to `strong`. */
  tone?: CellTone | undefined;
  /**
   * A figure: end aligned, tabular figures, and the cell never wraps.
   * @default the column's, from a `numeric` head cell
   */
  numeric?: boolean | undefined;
  /** A small monospace face for a code or a type, and the cell never wraps. */
  mono?: boolean | undefined;
  /** Caps the width and cuts a long value with an ellipsis on one line, the full text in a `title`. Plain text content only. */
  truncate?: boolean | undefined;
  /** A second, muted line under the content. */
  secondary?: ReactNode;
  children?: ReactNode;
} & Rest<"td", "align">): ReactElement {
  const foot = useContext(SectionContext) === "foot";
  const { size } = useContext(TableContext);
  const column = useNumericColumn();
  const figure = numeric ?? column;
  const side = align ?? (figure ? "end" : "start");
  return (
    <td
      {...rest}
      className={cellClass({ align: side, size, indent, tone, foot, numeric: figure, mono })}
    >
      <CellBody align={side} truncate={truncate} secondary={secondary}>
        {children}
      </CellBody>
    </td>
  );
}

/** The classes of a cell: the tone (`strong` by default in a foot, and a foot's cells are medium whatever the tone), then the wrapping rule. */
function cellClass({
  align,
  size,
  indent,
  tone,
  foot,
  numeric,
  mono,
}: {
  align: Align;
  size: Size;
  indent: Indent | undefined;
  tone: CellTone | undefined;
  foot: boolean;
  numeric: boolean;
  mono: boolean;
}): string {
  const resolved = tone ?? (foot ? "strong" : "neutral");
  return cx(
    PAD[size].cell,
    align === "start" && indent !== undefined && INDENT[size][indent],
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
        <div className={cx(TRUNCATE_WIDTH, "truncate", TRUNCATE_ALIGN[align])} title={text}>
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
