import { Children, type ReactElement, type ReactNode, useContext } from "react";
import { cx } from "./cx.js";
import type { Size } from "./size.js";
import { TableContext, useNumericColumn } from "./tableColumns.js";
import { ALIGN, type Align, PAD, type Rest, SectionContext } from "./tableRow.js";
import type { Tone } from "./tone.js";
import { TEXT_TONE } from "./typography.js";

/* The head and body cells of a `Table`, exported from `Table.tsx`. */

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

/**
 * The wrapping rule: a figure or code never breaks; prose wraps, down to `min-w-48`. A cell that
 * holds an element (a link, a `Pill`, a `Switch`, a `Button`) takes its content's width.
 */
function figureClass(numeric: boolean, mono: boolean, prose: boolean): string {
  if (!numeric && !mono) return prose ? "min-w-48" : "";
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
 * muted line under the content. One rule for wrapping: prose (a cell of plain text) wraps onto more
 * lines (never narrower than `min-w-48`, so it scrolls the table before it becomes a sliver), a cell
 * that holds a control or a link takes that content's width, and a `numeric` or `mono` cell (a
 * figure, a code, a type) never breaks. `truncate` caps a long value's width, cuts it with
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
      className={cellClass({
        align: side,
        size,
        indent,
        tone,
        foot,
        numeric: figure,
        mono,
        prose: Children.toArray(children).every(isText),
      })}
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
  prose,
}: {
  align: Align;
  size: Size;
  indent: Indent | undefined;
  tone: CellTone | undefined;
  foot: boolean;
  numeric: boolean;
  mono: boolean;
  prose: boolean;
}): string {
  const resolved = tone ?? (foot ? "strong" : "neutral");
  return cx(
    PAD[size].cell,
    align === "start" && indent !== undefined && INDENT[size][indent],
    ALIGN[align],
    TONE[resolved],
    foot && resolved !== "strong" && "font-medium",
    figureClass(numeric, mono, prose),
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
