import type { ComponentPropsWithoutRef, ReactElement, ReactNode } from "react";
import { Card } from "./ui.js";
import { Container } from "./Container.js";
import { cx } from "./cx.js";
import { PageHeader, PageHeaderContent, type PageHeaderProps } from "./PageHeader.js";
import { Stack } from "./Stack.js";

// Compositions of the layout foundation. None sets a page width or outer padding of its own; the
// ones that narrow their content do it inside the Container they are rendered in.

/** A list page: header, an optional `filters` slot, then the list, or `empty` when `isEmpty`. */
export function ListLayout({
  filters,
  empty,
  isEmpty = false,
  children,
  ...header
}: PageHeaderProps & {
  filters?: ReactNode;
  /** Shown in place of `children` when `isEmpty`. */
  empty?: ReactNode;
  isEmpty?: boolean;
  children?: ReactNode;
}): ReactElement {
  return (
    <>
      <PageHeader {...header} />
      <Stack>
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
  ...header
}: PageHeaderProps & { aside: ReactNode; children: ReactNode }): ReactElement {
  return (
    <>
      <PageHeader {...header} />
      <div className="grid gap-6 lg:grid-cols-3">
        <Stack className="min-w-0 lg:col-span-2">{children}</Stack>
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
  className,
  ...form
}: Omit<PageHeaderProps, "actions"> & { actions?: ReactNode; children: ReactNode } & Omit<
    ComponentPropsWithoutRef<"form">,
    "title"
  >): ReactElement {
  return (
    <>
      <PageHeader breadcrumbs={breadcrumbs} title={title} subtitle={subtitle} tabs={tabs} />
      <form className={cx("max-w-3xl", className)} {...form}>
        <Stack>
          {children}
          {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
        </Stack>
      </form>
    </>
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
  className,
  children,
}: {
  columns?: keyof typeof COLUMNS;
  className?: string;
  children: ReactNode;
}): ReactElement {
  return (
    <div className={cx("grid grid-cols-1 gap-4 sm:grid-cols-2", COLUMNS[columns], className)}>
      {children}
    </div>
  );
}

/**
 * A full-height `rail` beside the `children` canvas. Render it in `<AppShell bleed>`: it fills what
 * the shell's flex column leaves under the header, so no header height is written down. The rail is
 * `md:w-60` and stacks above the canvas below `md`; the canvas keeps the Container's padding.
 *
 * It deliberately breaks the shared left edge from `md` up: a full-height rail needs the viewport's
 * left edge, so the rail starts at x=0 and the canvas at the rail's width plus the Container's
 * padding (264 at 1280), not at the header logo's x. Below `md` every layout agrees.
 */
export function SidebarLayout({
  rail,
  children,
}: {
  rail: ReactNode;
  children: ReactNode;
}): ReactElement {
  return (
    <div className="flex min-h-0 flex-1 flex-col md:flex-row">
      <aside className="w-full shrink-0 border-b border-slate-200 bg-slate-50 p-4 md:w-60 md:border-r md:border-b-0">
        {rail}
      </aside>
      <div className="min-w-0 flex-1">
        {/* py-8 is AppShell's own main padding: the canvas starts at the same y as a Container page. */}
        <Container className="py-8">{children}</Container>
      </div>
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
}: {
  panel?: ReactNode;
  children: ReactNode;
}): ReactElement {
  return (
    <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
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
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  children?: ReactNode;
}): ReactElement {
  return (
    <div className="mx-auto w-full max-w-md pt-16">
      <Card as="div">
        <Stack>
          <PageHeaderContent title={title} subtitle={subtitle} />
          {children}
        </Stack>
      </Card>
    </div>
  );
}
