import {
  Children,
  type ComponentPropsWithoutRef,
  isValidElement,
  type ReactElement,
  type ReactNode,
} from "react";
import { Card } from "./Card.js";
import { cx, focusRing } from "./cx.js";
import { PageHeader, PageHeaderContent, type PageHeaderProps } from "./PageHeader.js";
import { STACK_WIDTH, Stack, type StackGap } from "./Stack.js";
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

/** A detail page: header, then `children` (two thirds from `lg`) beside `aside` (one third), which stacks below on a smaller screen. */
export function DetailLayout({
  aside,
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
  children: ReactNode;
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
      <div {...rest} className="grid gap-6 lg:grid-cols-3">
        <div className="min-w-0 lg:col-span-2">
          <Stack>{children}</Stack>
        </div>
        <aside className="min-w-0">
          <Stack>{aside}</Stack>
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
 * A text page: header, then `children` stacked `gap` apart (`md` by default), all in one `narrow`
 * (`max-w-3xl`) reading column that starts at the Container's left edge (it is not re-centred, so
 * the title does not jump). Unlike `FormLayout` the header sits inside the column, so its `actions`
 * stay beside the text instead of at the Container's far edge.
 */
export function ProseLayout({
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
  children?: ReactNode;
} & Passthrough): ReactElement {
  return (
    <div {...rest} className={STACK_WIDTH.narrow}>
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

/** `columns="auto"` fits as many cards per row as the width allows, none narrower than this. */
const AUTO_MIN_WIDTH = {
  sm: "grid-cols-[repeat(auto-fill,minmax(12rem,1fr))]",
  md: "grid-cols-[repeat(auto-fill,minmax(17rem,1fr))]",
} as const;

type CardGridProps = (
  | {
      /**
       * Cards per row from `lg` (one on a phone, two from `sm`), or `auto` for as many as fit.
       * @default 3
       */
      columns?: keyof typeof COLUMNS | undefined;
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

/**
 * A responsive grid of tiles: one column on a phone, two from `sm`, `columns` from `lg`.
 * `columns="auto"` instead fits as many per row as the width allows, each at least `minWidth` wide:
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
        columns === "auto"
          ? AUTO_MIN_WIDTH[minWidth]
          : cx("grid-cols-1 sm:grid-cols-2", COLUMNS[columns]),
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
 * A `rail` of links beside the `children` canvas, in the Container the shell already gives every
 * page (a plain `<AppShell>`, no `bleed`): the rail starts at the header logo's x and the canvas
 * ends at the header's right edge. The rail has no background and no border, so it is a list of
 * links on the page; a `Tabs variant="pill" orientation="vertical"` is its content. From `md` it is `w-56` with
 * the canvas filling the rest; below `md` it stacks above the canvas. A long rail sets `railLabel`:
 * below `md` it then folds behind a disclosure of that name, closed, so the page comes first on a
 * phone, and from `md` it is the same rail. Upgrading from 0.2: the rail no longer has a fill, a
 * border or a fixed height, and it no longer sits beside the canvas on a phone.
 */
export function SidebarLayout({
  rail,
  railLabel,
  children,
  ...rest
}: {
  /** The links beside the canvas, usually a `Tabs variant="pill" orientation="vertical"`. */
  rail: ReactNode;
  /** Folds the rail behind a disclosure with this name below `md` (a long rail). Left out, the rail is always open. */
  railLabel?: string | undefined;
  children: ReactNode;
} & Passthrough): ReactElement {
  return (
    <div {...rest} className="flex flex-col gap-8 md:flex-row md:gap-10">
      <aside className="w-full shrink-0 md:w-56">
        {railLabel === undefined ? (
          rail
        ) : (
          <details className="group md:[&::details-content]:[content-visibility:visible]">
            <summary
              className={cx(
                "flex cursor-pointer list-none items-center justify-between rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-900 select-none hover:bg-slate-50 md:hidden [&::-webkit-details-marker]:hidden",
                focusRing,
              )}
            >
              {railLabel}
              <svg
                viewBox="0 0 20 20"
                width="16"
                height="16"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                className="shrink-0 text-slate-500 group-open:rotate-180"
              >
                <path d="M5 8l5 5 5-5" />
              </svg>
            </summary>
            <div className="mt-2 md:mt-0">{rail}</div>
          </details>
        )}
      </aside>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

/**
 * Edge-to-edge `children` with an optional right `panel` (`lg:w-72`) that stacks below on a smaller
 * screen. Render it in `<AppShell bleed>`. It deliberately breaks the shared left edge: a viewer
 * that needs the whole width has no Container of its own, so `children` start at the viewport's
 * left edge. `padded` gives them the Container's padding instead (`px-4`, `sm:px-6`, `py-8`), for
 * a page of ordinary content beside a full-height `panel`. A `bar` runs the full width above both,
 * on the surface with a bottom line, and sticks under AppShell's header as the page scrolls.
 */
export function FullBleedLayout({
  bar,
  panel,
  padded = false,
  children,
  ...rest
}: {
  /** A full-width row above `children` and `panel` that sticks under the header, e.g. a viewer's title and actions. `padded` does not pad it. */
  bar?: ReactNode;
  /** A side column on the right (`lg:w-72`) on a tinted surface; below `lg` it stacks under `children`. */
  panel?: ReactNode;
  /** Pads `children` as the Container pads every other page. Off, they run to the viewport's edges. */
  padded?: boolean | undefined;
  children: ReactNode;
} & Passthrough): ReactElement {
  const row = (
    <>
      <div className={cx("min-w-0 flex-1", padded && "px-4 py-8 sm:px-6")}>{children}</div>
      {panel && (
        <aside className="w-full shrink-0 border-t border-slate-200 bg-slate-50 p-4 lg:w-72 lg:border-t-0 lg:border-l">
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
      <div className="sticky top-[var(--app-header,0px)] z-5 border-b border-slate-200 bg-white px-4 py-2 sm:px-6">
        {bar}
      </div>
      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">{row}</div>
    </div>
  );
}

/** A narrow card (`max-w-md`) centred in the Container at a fixed offset from the top, for sign-in, landing, not-found and error pages. The one layout that does not share the left edge. */
export function CenteredLayout({
  title,
  subtitle,
  children,
  ...rest
}: {
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
          <PageHeaderContent title={title} subtitle={subtitle} />
          {children}
        </Stack>
      </Card>
    </div>
  );
}
