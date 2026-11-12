import {
  Children,
  type ComponentPropsWithoutRef,
  isValidElement,
  type ReactElement,
  type ReactNode,
} from "react";
import { Card } from "./Card.js";
import { cx } from "./cx.js";
import { PageHeader, PageHeaderContent, type PageHeaderProps } from "./PageHeader.js";
import { STACK_WIDTH, Stack, type StackGap } from "./Stack.js";
import { useScrollEdges } from "./scrollEdges.js";
import { scrollStopProps, useScrollStop } from "./scrollStop.js";
import { STICKY_ASIDE_LG, STICKY_FADE_LG, STICKY_SCROLL_LG } from "./stickyColumn.js";
import { StickyBar } from "./StickyBar.js";
import type { Passthrough, Unstyled } from "./props.js";

// Compositions of the layout foundation. None sets a page width or outer padding of its own; the
// ones that narrow their content do it inside the Container they are rendered in.

/** A list page: header, an optional `filters` slot, then the list, or `empty` when `isEmpty`. */
export function ListLayout({
  filters,
  empty,
  isEmpty = false,
  children,
  breadcrumbs,
  title,
  subtitle,
  actions,
  tabs,
  ...rest
}: PageHeaderProps & {
  /** A row between the header and the list, e.g. a `FilterGroup` or a `SearchInput`. */
  filters?: ReactNode;
  /** Shown in place of `children` when `isEmpty`. */
  empty?: ReactNode;
  /** Show `empty` instead of `children`. */
  isEmpty?: boolean;
  children?: ReactNode;
} & Passthrough): ReactElement {
  return (
    <>
      <PageHeader
        breadcrumbs={breadcrumbs}
        title={title}
        subtitle={subtitle}
        actions={actions}
        tabs={tabs}
      />
      <Stack {...rest}>
        {filters}
        {isEmpty ? empty : children}
      </Stack>
    </>
  );
}

/**
 * A detail page: header, then `children` (two thirds from `lg`) beside `aside` (one third), which
 * stacks below on a smaller screen. `stickyAside` keeps the aside in view from `lg` as a long page
 * scrolls: it sticks under AppShell's header and, if it is taller than the room left, scrolls
 * itself so its end stays reachable.
 */
export function DetailLayout({
  aside,
  asideLabel,
  stickyAside = false,
  children,
  breadcrumbs,
  title,
  subtitle,
  actions,
  tabs,
  ...rest
}: PageHeaderProps & {
  /** The side column: one third from `lg`, below `children` on a smaller screen. */
  aside: ReactNode;
  /** Names the aside's landmark (`aria-label`), so a page with another complementary landmark can tell them apart. It does not fold the aside. Left out, the aside is unnamed. */
  asideLabel?: string | undefined;
  /**
   * From `lg`, keeps the aside in view under the header as the page scrolls; an aside taller than
   * the screen scrolls inside itself. Off by default, since an aside of ordinary cards may be
   * taller than the screen. Below `lg` the aside stacks as ever.
   * @default false
   */
  stickyAside?: boolean | undefined;
  children: ReactNode;
} & Passthrough): ReactElement {
  const { element, attach, stop } = useScrollStop();
  useScrollEdges(element, "y");
  const { props, ring } = scrollStopProps(stickyAside && stop, { label: asideLabel });
  return (
    <>
      <PageHeader
        breadcrumbs={breadcrumbs}
        title={title}
        subtitle={subtitle}
        actions={actions}
        tabs={tabs}
      />
      <div {...rest} className="grid gap-6 lg:grid-cols-3">
        <div className="min-w-0 lg:col-span-2">
          <Stack>{children}</Stack>
        </div>
        <aside className={cx("min-w-0", stickyAside && STICKY_ASIDE_LG)} aria-label={asideLabel}>
          <div
            ref={stickyAside ? attach : undefined}
            {...props}
            className={stickyAside ? cx(STICKY_SCROLL_LG, STICKY_FADE_LG, ring) : undefined}
          >
            <Stack>{aside}</Stack>
          </div>
        </aside>
      </div>
    </>
  );
}

/** A form page: header (no header `actions`), then a `max-w-3xl` column that starts at the Container's left edge (it is not re-centred), with an `actions` row at the end. Other props go on the `<form>`. */
export function FormLayout({
  actions,
  children,
  breadcrumbs,
  title,
  subtitle,
  tabs,
  ...form
}: Omit<PageHeaderProps, "actions"> & {
  /** The row at the end of the form: its submit and cancel buttons. */
  actions?: ReactNode;
  children: ReactNode;
} & Unstyled<Omit<ComponentPropsWithoutRef<"form">, "title">>): ReactElement {
  return (
    <>
      <PageHeader breadcrumbs={breadcrumbs} title={title} subtitle={subtitle} tabs={tabs} />
      <form {...form} className="max-w-3xl">
        <Stack>
          {children}
          {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
        </Stack>
      </form>
    </>
  );
}

/**
 * A text page: header, then `children` stacked `gap` apart (`md` by default), all in one column that
 * starts at the Container's left edge (it is not re-centred, so the title does not jump). `width`
 * sets the column: `narrow` (`max-w-3xl`, the default) is a reading measure; `wide` (`max-w-5xl`) and
 * `full` (the Container's whole width) suit a page that is not long prose, such as a pricing page.
 * Paragraphs (`Text`) and the header's lede keep their own reading measure whatever the width.
 * Unlike `FormLayout` the header sits inside the column, so its `actions` stay beside the text
 * instead of at the Container's far edge.
 */
export function ProseLayout({
  width = "narrow",
  gap = "md",
  children,
  breadcrumbs,
  title,
  subtitle,
  actions,
  tabs,
  ...rest
}: PageHeaderProps & {
  /**
   * The space between blocks: `xs` gap-2, `sm` gap-4, `md` gap-6, `lg` gap-8, `xl` gap-12 (gap-16 from `sm`).
   * @default md
   */
  gap?: StackGap | undefined;
  /**
   * The column's width: `narrow` max-w-3xl, `wide` max-w-5xl, `full` the Container's width.
   * @default narrow
   */
  width?: "narrow" | "wide" | "full" | undefined;
  children?: ReactNode;
} & Passthrough): ReactElement {
  return (
    <div {...rest} className={STACK_WIDTH[width]}>
      <PageHeader
        breadcrumbs={breadcrumbs}
        title={title}
        subtitle={subtitle}
        actions={actions}
        tabs={tabs}
      />
      <Stack gap={gap}>{children}</Stack>
    </div>
  );
}

const COLUMNS = {
  2: "lg:grid-cols-2",
  3: "lg:grid-cols-3",
  4: "lg:grid-cols-4",
} as const;

/** Two unequal columns, one on a phone, the ratio from `md`; `minmax(0,…)` lets a long value shrink instead of widening its column. */
const RATIOS = {
  "2:1": "md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]",
  "1:2": "md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]",
} as const;

/** `columns="auto"` fits as many cards per row as the width allows, none narrower than this. */
const AUTO_MIN_WIDTH = {
  sm: "grid-cols-[repeat(auto-fill,minmax(12rem,1fr))]",
  md: "grid-cols-[repeat(auto-fill,minmax(17rem,1fr))]",
} as const;

type CardGridProps = (
  | {
      /**
       * Cards per row from `lg` (one on a phone, two from `sm`), `auto` for as many as fit, or a ratio:
       * `2:1` or `1:2` is two columns, the first or the second twice as wide, from `md` (one on a phone).
       * @default 3
       */
      columns?: keyof typeof COLUMNS | keyof typeof RATIOS | undefined;
      /** With `columns="auto"`, the narrowest a card gets: `md` 17rem or `sm` 12rem. */
      minWidth?: undefined;
    }
  | {
      /**
       * Cards per row from `lg` (one on a phone, two from `sm`), or `auto` for as many as fit.
       * @default 3
       */
      columns: "auto";
      /**
       * With `columns="auto"`, the narrowest a card gets: `md` 17rem or `sm` 12rem.
       * @default md
       */
      minWidth?: keyof typeof AUTO_MIN_WIDTH | undefined;
    }
) & {
  /** `start` keeps each card its own height; the default stretches every card to the tallest in its row. */
  align?: "stretch" | "start" | undefined;
  /** `ul` makes the grid a list: each child is wrapped in an `<li>`. Default `div`. */
  as?: "div" | "ul" | undefined;
  children: ReactNode;
} & Passthrough;

function gridColumns(
  columns: keyof typeof COLUMNS | keyof typeof RATIOS | "auto",
  minWidth: keyof typeof AUTO_MIN_WIDTH,
): string {
  if (columns === "auto") return AUTO_MIN_WIDTH[minWidth];
  if (typeof columns === "string") return cx("grid-cols-1", RATIOS[columns]);
  return cx("grid-cols-1 sm:grid-cols-2", COLUMNS[columns]);
}

/**
 * A responsive grid of tiles: one column on a phone, two from `sm`, `columns` from `lg`.
 * `columns="2:1"` or `"1:2"` is instead two unequal columns from `md`, one on a phone: a main card beside a
 * narrow one (a record's detail and its side panel). `columns="auto"` instead fits as many per row as the width allows, each at least `minWidth` wide:
 * `md` (17rem, the default) or `sm` (12rem). `align="start"` keeps each card its own height
 * instead of stretching it to the tallest in its row. `as="ul"` makes it a list of cards for a
 * screen reader: the grid is a `<ul>` and each child is wrapped in an `<li>`, still stretched.
 */
export function CardGrid({
  columns = 3,
  minWidth = "md",
  align = "stretch",
  as: Tag = "div",
  children,
  ...rest
}: CardGridProps): ReactElement {
  return (
    <Tag
      {...rest}
      {...(Tag === "ul" ? { role: "list" } : {})}
      className={cx(
        "grid gap-4",
        gridColumns(columns, minWidth),
        align === "start" && "items-start",
      )}
    >
      {Tag === "ul"
        ? Children.toArray(children).map((child, index) => (
            // A grid, so the one child (a Card) fills the item's height as it does in a plain grid.
            <li key={isValidElement(child) ? child.key : index} className="grid">
              {child}
            </li>
          ))
        : children}
    </Tag>
  );
}

/**
 * Edge-to-edge `children` with an optional right `panel` (`lg:w-72`) that stacks below on a smaller
 * screen. Render it in `<AppShell bleed>`. It deliberately breaks the shared left edge: a viewer
 * that needs the whole width has no Container of its own, so `children` start at the viewport's
 * left edge. `padded` gives them the Container's padding instead (`px-4`, `sm:px-6`, `py-8`), for
 * a page of ordinary content beside a full-height `panel`. A `bar` is a `StickyBar` above both: the
 * full width, on the surface with a bottom line, sticking under AppShell's header as the page scrolls.
 */
export function FullBleedLayout({
  bar,
  panel,
  panelLabel,
  padded = false,
  children,
  ...rest
}: {
  /** A full-width row above `children` and `panel` that sticks under the header, e.g. a viewer's title and actions. `padded` does not pad it. */
  bar?: ReactNode;
  /** A side column on the right (`lg:w-72`) on a tinted surface; below `lg` it stacks under `children`. */
  panel?: ReactNode;
  /** Names the panel's `<aside>` landmark (`aria-label`). Left out, the panel is unnamed. */
  panelLabel?: string | undefined;
  /**
   * Pads `children` as the Container pads every other page. Off, they run to the viewport's edges.
   * A notice in the column is a plain `Callout` in a `Stack`, never a `Callout banner`.
   */
  padded?: boolean | undefined;
  children: ReactNode;
} & Passthrough): ReactElement {
  const row = (
    <>
      <div className={cx("min-w-0 flex-1", padded && "px-4 py-8 sm:px-6")}>{children}</div>
      {panel && (
        <aside
          className="w-full shrink-0 border-t border-slate-200 bg-slate-50 p-4 lg:w-72 lg:border-t-0 lg:border-l"
          aria-label={panelLabel}
        >
          {panel}
        </aside>
      )}
    </>
  );
  if (!bar) {
    return (
      <div {...rest} className="flex min-h-0 flex-1 flex-col lg:flex-row">
        {row}
      </div>
    );
  }
  return (
    <div {...rest} className="flex min-h-0 flex-1 flex-col">
      <StickyBar>{bar}</StickyBar>
      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">{row}</div>
    </div>
  );
}

/** A narrow card (`max-w-md`) centred in the Container at a fixed offset from the top, for sign-in, landing, not-found and error pages. The one layout that does not share the left edge. */
export function CenteredLayout({
  mark,
  title,
  subtitle,
  children,
  ...rest
}: {
  /** Drawn first in the card, above the title, e.g. a large status numeral. Not a heading. */
  mark?: ReactNode;
  /** The card's `h1`. */
  title: ReactNode;
  /** A muted line under the title. */
  subtitle?: ReactNode;
  children?: ReactNode;
} & Passthrough): ReactElement {
  return (
    <div {...rest} className="mx-auto w-full max-w-md pt-16">
      <Card as="div">
        <Stack>
          {mark}
          <PageHeaderContent title={title} subtitle={subtitle} />
          {children}
        </Stack>
      </Card>
    </div>
  );
}
