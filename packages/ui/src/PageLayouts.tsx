import type { ComponentPropsWithoutRef, ReactElement, ReactNode } from "react";
import { Card } from "./ui.js";
import { cx } from "./cx.js";
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
  filters?: ReactNode;
  /** Shown in place of `children` when `isEmpty`. */
  empty?: ReactNode;
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
}: PageHeaderProps & { aside: ReactNode; children: ReactNode } & Passthrough): ReactElement {
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
}: Omit<PageHeaderProps, "actions"> & { actions?: ReactNode; children: ReactNode } & Unstyled<
    Omit<ComponentPropsWithoutRef<"form">, "title">
  >): ReactElement {
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
  gap,
  children,
  breadcrumbs,
  title,
  subtitle,
  actions,
  tabs,
  ...rest
}: PageHeaderProps & {
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

/** A responsive grid of tiles: one column on a phone, two from `sm`, `columns` from `lg`. */
export function CardGrid({
  columns = 3,
  children,
  ...rest
}: {
  columns?: keyof typeof COLUMNS;
  children: ReactNode;
} & Passthrough): ReactElement {
  return (
    <div {...rest} className={cx("grid grid-cols-1 gap-4 sm:grid-cols-2", COLUMNS[columns])}>
      {children}
    </div>
  );
}

/**
 * A `rail` of links beside the `children` canvas, in the Container the shell already gives every
 * page (a plain `<AppShell>`, no `bleed`): the rail starts at the header logo's x and the canvas
 * ends at the header's right edge. The rail has no background and no border, so it is a list of
 * links on the page; a `NavTabs orientation="vertical"` is its content. From `md` it is `w-56` with
 * the canvas filling the rest; below `md` it stacks above the canvas. Upgrading from 0.2: the rail
 * no longer has a fill, a border or a fixed height, and it no longer sits beside the canvas on a
 * phone.
 */
export function SidebarLayout({
  rail,
  children,
  ...rest
}: {
  rail: ReactNode;
  children: ReactNode;
} & Passthrough): ReactElement {
  return (
    <div {...rest} className="flex flex-col gap-8 md:flex-row md:gap-10">
      <aside className="w-full shrink-0 md:w-56">{rail}</aside>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

/**
 * Edge-to-edge `children` with an optional right `panel` (`lg:w-72`) that stacks below on a smaller
 * screen. Render it in `<AppShell bleed>`. It deliberately breaks the shared left edge: a viewer
 * that needs the whole width has no Container of its own, so `children` start at the viewport's
 * left edge and add their own padding.
 */
export function FullBleedLayout({
  panel,
  children,
  ...rest
}: {
  panel?: ReactNode;
  children: ReactNode;
} & Passthrough): ReactElement {
  return (
    <div {...rest} className="flex min-h-0 flex-1 flex-col lg:flex-row">
      <div className="min-w-0 flex-1">{children}</div>
      {panel && (
        <aside className="w-full shrink-0 border-t border-slate-200 bg-slate-50 p-4 lg:w-72 lg:border-t-0 lg:border-l">
          {panel}
        </aside>
      )}
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
  title: ReactNode;
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
