import { Children, createContext, useContext } from "react";
import type { ComponentPropsWithoutRef, ReactElement, ReactNode } from "react";
import type { CalloutTone } from "./Callout.js";
import { cx, liftInteractive } from "./cx.js";
import { TEXT_TONE, type TextTone } from "./typography.js";

type Align = "start" | "center" | "end";

const ALIGN: Record<Align, string> = {
  start: "text-left",
  center: "text-center",
  end: "text-right",
};

/**
 * The text of a cell: its weight and colour. `default`, `strong` and `muted` are the plain ones; the
 * rest are the Callout's tones, for an amount that carries a meaning (a gain, an overspend). Colour
 * alone does not say it, so a signed figure or a word says it too.
 */
export type CellTone = "default" | "strong" | "muted" | CalloutTone;

const TONE: Record<CellTone, string> = {
  default: "text-slate-700",
  strong: "font-medium text-slate-900",
  neutral: "text-slate-600",
  ...TEXT_TONE,
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

/** The row's mark: a `tone` (stripe and fill, or faded), a `stripe` alone or `emphasis`, only one of them. */
type RowMark =
  | {
      /** The row's status: a stripe on the leading edge plus the tone's soft fill, or `muted` to fade the row. Give only one of `tone`, `stripe` and `emphasis`. */
      tone?: RowTone | undefined;
      /** A stripe on the leading edge in this tone, with no fill. Give only one of `tone`, `stripe` and `emphasis`. */
      stripe?: undefined;
      /** A subtotal in the body: the look of a `TableFoot` row, with strong cells, a firmer line above and no hover. Give only one of `tone`, `stripe` and `emphasis`. */
      emphasis?: false | undefined;
    }
  | {
      /** A stripe on the leading edge in this tone, with no fill. Give only one of `tone`, `stripe` and `emphasis`. */
      stripe?: TextTone | undefined;
      /** The row's status: a stripe on the leading edge plus the tone's soft fill, or `muted` to fade the row. Give only one of `tone`, `stripe` and `emphasis`. */
      tone?: undefined;
      /** A subtotal in the body: the look of a `TableFoot` row, with strong cells, a firmer line above and no hover. Give only one of `tone`, `stripe` and `emphasis`. */
      emphasis?: false | undefined;
    }
  | {
      /** A subtotal in the body: the look of a `TableFoot` row, with strong cells, a firmer line above and no hover. Give only one of `tone`, `stripe` and `emphasis`. */
      emphasis: boolean;
      /** The row's status: a stripe on the leading edge plus the tone's soft fill, or `muted` to fade the row. Give only one of `tone`, `stripe` and `emphasis`. */
      tone?: undefined;
      /** A stripe on the leading edge in this tone, with no fill. Give only one of `tone`, `stripe` and `emphasis`. */
      stripe?: undefined;
    };

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
  /** Names the table for assistive tech; it is not drawn. */
  caption?: string | undefined;
  /**
   * `card` sits the table in its own bordered card; `plain` drops the card, the head's tint and the row hover, for a table inside a card of its own.
   * @default card
   */
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
 * A `<tr>`, `relative`: the anchor a `TextLink stretch` (with `href`, or `render` for a router `<Link>`) stretches to. Any other link, button or
 * control in the row (a `TextLink`, a `Button`, a `Checkbox`) sits above that link and is clickable
 * on its own, with no class from the caller. Use it in the head and the
 * body. In the body it also draws the line above the row and, unless the table is `plain`, the hover
 * fill. `tone` marks the row's status (see `RowTone`): a stripe on the leading edge and a soft fill,
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
  children,
  ...rest
}: RowMark & { children: ReactNode } & Rest<"tr">): ReactElement {
  const outer = useContext(SectionContext);
  const plain = useContext(VariantContext) === "plain";
  const section = emphasis && outer === "body" ? "foot" : outer;
  return (
    <SectionContext.Provider value={section}>
      <tr {...rest} className={rowClass(section, plain, tone, stripe)}>
        {children}
      </tr>
    </SectionContext.Provider>
  );
}

/** The classes of a row: a line above in the body and the foot, the hover fill and the tone's or stripe's look in the body only. */
function rowClass(
  section: "head" | "body" | "foot" | undefined,
  plain: boolean,
  tone: RowTone | undefined,
  stripe: TextTone | undefined,
): string {
  if (section === "foot") return cx("relative border-t border-slate-300", liftInteractive);
  if (section !== "body") return cx("relative", liftInteractive);
  const line = cx("relative border-t border-slate-200/70", liftInteractive);
  const hover = !plain && "hover:bg-slate-50";
  if (stripe !== undefined) return cx(line, hover, TEXT_TONE[stripe], STRIPE);
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
}: {
  /** The group's name, at the start of the row. */
  label: ReactNode;
  /** Content at the far end of the row: a count, a subtotal, a small button. */
  trailing?: ReactNode;
  /** The table's real column count, so the header spans the whole row. */
  colSpan: number;
} & Rest<"tr">): ReactElement {
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

/**
 * A column title, `<th scope="col">`. A column with nothing to show in its head (a row's actions)
 * takes `srLabel` instead of `children`: the name a screen reader hears ("Actions"), visually
 * hidden so the head keeps its column.
 */
export function TableHeaderCell({
  align = "start",
  children,
  srLabel,
  ...rest
}: {
  /**
   * The cell's horizontal alignment; `end` for figures, `center` over a centred column.
   * @default start
   */
  align?: Align | undefined;
} & (
  | { children?: ReactNode; srLabel?: undefined }
  | {
      children?: undefined;
      /** The column's name for a screen reader, visually hidden, for a column with no visible title (a row's actions). */
      srLabel: string;
    }
) &
  Rest<"th", "align" | "scope">): ReactElement {
  return (
    <th
      {...rest}
      scope="col"
      className={cx("whitespace-nowrap px-4 py-2.5 font-medium", ALIGN[align])}
    >
      {srLabel === undefined ? children : <span className="sr-only">{srLabel}</span>}
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

/** A step of a hierarchy under a row: the cell's own `pl-4` plus 1rem a level. */
type Indent = 1 | 2 | 3;

const INDENT: Record<Indent, string> = { 1: "pl-8", 2: "pl-12", 3: "pl-16" };

/**
 * A `<td>`. `tone` is the text weight and colour (see `CellTone`; in a `TableFoot` it defaults to
 * `strong`); `numeric` sets tabular figures, `mono` a small mono face. `secondary` is a second,
 * muted line under the content. One rule for wrapping: prose wraps onto more lines (never narrower
 * than `min-w-48`, so it scrolls the table before it becomes a sliver), and a `numeric` or `mono`
 * cell (a figure, a code, a type) never breaks. `truncate` caps a long value's width, cuts it with
 * an ellipsis on one line and puts the full text in a `title`; the content is then plain text (strings and
 * numbers), since that is what the title shows. `colSpan` passes through: a cell that
 * spans the row is a full-width panel (an empty state, a note under a group), and `align="center"`
 * centres it. `indent` sets a start-aligned cell in by 1 to 3 levels, for a line under a parent row.
 */
export function TableCell({
  align = "start",
  tone,
  numeric = false,
  mono = false,
  truncate = false,
  indent,
  secondary,
  children,
  ...rest
}: {
  /**
   * The cell's horizontal alignment; `end` for figures, `center` for a full-width note or empty state.
   * @default start
   */
  align?: Align | undefined;
  /** Sets the cell in by this many levels (1 to 3), for a line under a parent row. Start-aligned cells only. */
  indent?: Indent | undefined;
  /** The text weight and colour (see `CellTone`). In a `TableFoot` it defaults to `strong`. */
  tone?: CellTone | undefined;
  /** Tabular figures, and the cell never wraps. */
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
  return (
    <td {...rest} className={cellClass({ align, indent, tone, foot, numeric, mono })}>
      <CellBody align={align} truncate={truncate} secondary={secondary}>
        {children}
      </CellBody>
    </td>
  );
}

/** The classes of a cell: the tone (`strong` by default in a foot, and a foot's cells are medium whatever the tone), then the wrapping rule. */
function cellClass({
  align,
  indent,
  tone,
  foot,
  numeric,
  mono,
}: {
  align: Align;
  indent: Indent | undefined;
  tone: CellTone | undefined;
  foot: boolean;
  numeric: boolean;
  mono: boolean;
}): string {
  const resolved = tone ?? (foot ? "strong" : "default");
  return cx(
    "px-4 py-3",
    align === "start" && indent !== undefined && INDENT[indent],
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
