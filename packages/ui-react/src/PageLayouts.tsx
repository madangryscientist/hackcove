import { Children, type ComponentPropsWithoutRef, type ReactElement, type ReactNode } from "react";
import { Callout } from "./Callout.js";
import { Card } from "./Card.js";
import { cx } from "./cx.js";
import { PageHeader, PageHeaderContent, type PageHeaderProps } from "./PageHeader.js";
import { STACK_WIDTH, Stack, type StackGap } from "./Stack.js";
import { SplitColumns } from "./SideColumn.js";
import { StickyBar } from "./StickyBar.js";
import type { Passthrough, Unstyled } from "./props.js";
import { EmptySlot } from "./emptySlot.js";
import { useWait } from "./layoutWait.js";
export { CardGrid } from "./CardGrid.js";
import { type LoadingProps, LoadingScope } from "./skeleton.js";

// Compositions of the layout foundation. None sets a page width or outer padding of its own; the
// ones that narrow their content do it inside the Container they are rendered in.

/** A list page: header, an optional `filters` slot, then the list, or `empty` when there are no children. While `loading` it owns the wait and passes it to everything inside, the header too. With no children yet it draws a card of row bones, never `empty`. */
export function ListLayout({
  filters,
  empty,
  children,
  breadcrumbs,
  title,
  description,
  actions,
  tabs,
  loading,
  loadingLabel,
  ...rest
}: PageHeaderProps & {
  /** A row between the header and the list, e.g. a `Fieldset` of chips or an `Input type="search"`. */
  filters?: ReactNode;
  /** Shown in place of `children` when there are none (no rows, an empty array, `null`): an `EmptyState`. */
  empty?: ReactNode;
  children?: ReactNode;
} & Passthrough): ReactElement {
  const wait = useWait(loading, loadingLabel);
  return (
    <LoadingScope loading={wait.loading}>
      <PageHeader
        breadcrumbs={breadcrumbs}
        title={title}
        description={description}
        actions={actions}
        tabs={tabs}
      />
      <Stack {...rest} {...wait.attrs}>
        {filters}
        <ListBody loading={wait.loading} empty={empty}>
          {children}
        </ListBody>
        {wait.label}
      </Stack>
    </LoadingScope>
  );
}

/** A list page's records; with none, a card of row bones while loading (loading beats empty), else `empty`. */
function ListBody({
  loading,
  empty,
  children,
}: {
  loading: boolean;
  empty: ReactNode;
  children: ReactNode;
}): ReactNode {
  if (Children.toArray(children).length > 0) return children;
  if (loading) return <Card flush>{null}</Card>;
  return <EmptySlot size="md">{empty}</EmptySlot>;
}

/**
 * A detail page: header, then `children` (two thirds from `lg`) beside `aside` (one third), which
 * stacks below on a smaller screen: a `SideColumn asideWidth="third"` under a `PageHeader`. `sticky` keeps the aside in view from `lg` as a long page
 * scrolls: it sticks under AppShell's header and, if it is taller than the room left, scrolls
 * itself so its end stays reachable. While `loading` it owns the wait and passes it to everything inside, the header too.
 */
export function DetailLayout({
  aside,
  asideLabel,
  sticky = false,
  children,
  breadcrumbs,
  title,
  description,
  actions,
  tabs,
  loading,
  loadingLabel,
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
  sticky?: boolean | undefined;
  children: ReactNode;
} & Passthrough): ReactElement {
  const wait = useWait(loading, loadingLabel);
  return (
    <LoadingScope loading={wait.loading}>
      <PageHeader
        breadcrumbs={breadcrumbs}
        title={title}
        description={description}
        actions={actions}
        tabs={tabs}
      />
      <SplitColumns
        {...rest}
        {...wait.attrs}
        asideWidth="third"
        label={asideLabel}
        fold={false}
        sticky={sticky}
        aside={<Stack>{aside}</Stack>}
      >
        <Stack>
          {children}
          {wait.label}
        </Stack>
      </SplitColumns>
    </LoadingScope>
  );
}

/** A form page: header (no header `actions`), then a `max-w-3xl` column that starts at the Container's start edge (it is not re-centred), with an `actions` row at the end. `error` is the submit's failure, a danger `Callout` (an alert) directly above that row. Other props go on the `<form>`. While `loading` it owns the wait and passes it to everything inside, the header too. */
export function FormLayout({
  actions,
  error,
  children,
  breadcrumbs,
  title,
  description,
  tabs,
  loading,
  loadingLabel,
  ...form
}: Omit<PageHeaderProps, "actions"> & {
  /** The row at the end of the form: its submit and cancel buttons. */
  actions?: ReactNode;
  /**
   * What went wrong with the whole submit (the server refused it, no connection), announced as an
   * alert directly above the `actions`. An error about one field is that `Field`'s `error`.
   */
  error?: ReactNode;
  children: ReactNode;
} & Unstyled<Omit<ComponentPropsWithoutRef<"form">, "title">>): ReactElement {
  const wait = useWait(loading, loadingLabel);
  return (
    <LoadingScope loading={wait.loading}>
      <PageHeader breadcrumbs={breadcrumbs} title={title} description={description} tabs={tabs} />
      <form {...form} {...wait.attrs} className="max-w-3xl">
        <Stack>
          {children}
          {error && <Callout tone="danger">{error}</Callout>}
          {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
        </Stack>
        {wait.label}
      </form>
    </LoadingScope>
  );
}

/**
 * A text page: header, then `children` stacked `gap` apart (`md` by default), all in one column that
 * starts at the Container's start edge (it is not re-centred, so the title does not jump). `width`
 * sets the column: `narrow` (`max-w-3xl`, the default) is a reading measure; `wide` (`max-w-5xl`) and
 * `full` (the Container's whole width) suit a page that is not long prose, such as a pricing page.
 * Paragraphs (`Text`) and the header's lede keep their own reading measure whatever the width.
 * Unlike `FormLayout` the header sits inside the column, so its `actions` stay beside the text
 * instead of at the Container's far edge. While `loading` it owns the wait and passes it to everything inside, the header too.
 */
export function ProseLayout({
  width = "narrow",
  gap = "md",
  children,
  breadcrumbs,
  title,
  description,
  actions,
  tabs,
  loading,
  loadingLabel,
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
  const wait = useWait(loading, loadingLabel);
  return (
    <LoadingScope loading={wait.loading}>
      <div {...rest} {...wait.attrs} className={STACK_WIDTH[width]}>
        <PageHeader
          breadcrumbs={breadcrumbs}
          title={title}
          description={description}
          actions={actions}
          tabs={tabs}
        />
        <Stack gap={gap}>{children}</Stack>
        {wait.label}
      </div>
    </LoadingScope>
  );
}

/**
 * Edge-to-edge `children` with an optional `aside` at the end (`lg:w-72`) that stacks below on a smaller
 * screen. Render it in `<AppShell bleed>`. It deliberately breaks the shared start edge: a viewer
 * that needs the whole width has no Container of its own, so `children` start at the viewport's
 * start edge. `padded` gives them the Container's padding instead (`px-4`, `sm:px-6`, `py-8`), for
 * a page of ordinary content beside a full-height `aside`. A `bar` is a `StickyBar` above both: the
 * full width, on the surface with a bottom line, sticking under AppShell's header as the page scrolls.
 * While `loading` it owns the wait and passes it to everything inside, the header too.
 */
export function FullBleedLayout({
  bar,
  aside,
  asideLabel,
  padded = false,
  children,
  loading,
  loadingLabel,
  ...rest
}: {
  /** A full-width row above `children` and `aside` that sticks under the header, e.g. a viewer's title and actions. `padded` does not pad it. */
  bar?: ReactNode;
  /** A side column on the right (`lg:w-72`) on a tinted surface; below `lg` it stacks under `children`. */
  aside?: ReactNode;
  /** Names the `<aside>` landmark (`aria-label`). Left out, it is unnamed. */
  asideLabel?: string | undefined;
  /**
   * Pads `children` as the Container pads every other page. Off, they run to the viewport's edges.
   * A notice in the column is a plain `Callout` in a `Stack`, never a `Callout banner`.
   */
  padded?: boolean | undefined;
  children: ReactNode;
} & LoadingProps &
  Passthrough): ReactElement {
  const wait = useWait(loading, loadingLabel);
  const row = (
    <>
      <div className={cx("min-w-0 flex-1", padded && "px-4 py-8 sm:px-6")}>{children}</div>
      {aside && (
        <aside
          className="w-full shrink-0 border-t border-slate-200 bg-slate-50 p-4 lg:w-72 lg:border-t-0 lg:border-l"
          aria-label={asideLabel}
        >
          {aside}
        </aside>
      )}
    </>
  );
  if (!bar) {
    return (
      <div {...rest} {...wait.attrs} className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <LoadingScope loading={wait.loading}>{row}</LoadingScope>
        {wait.label}
      </div>
    );
  }
  return (
    <div {...rest} {...wait.attrs} className="flex min-h-0 flex-1 flex-col">
      <LoadingScope loading={wait.loading}>
        <StickyBar>{bar}</StickyBar>
        <div className="flex min-h-0 flex-1 flex-col lg:flex-row">{row}</div>
      </LoadingScope>
      {wait.label}
    </div>
  );
}

/** A narrow card (`max-w-md`) centred in the Container at a fixed offset from the top, for sign-in, landing, not-found and error pages. The one layout that does not share the start edge. While `loading` it owns the wait and passes it to everything inside, the header too. */
export function CenteredLayout({
  mark,
  title,
  description,
  children,
  loading,
  loadingLabel,
  ...rest
}: {
  /** Drawn first in the card, above the title, e.g. a large status numeral. Not a heading. */
  mark?: ReactNode;
  /** The card's `h1`. */
  title: ReactNode;
  /** A muted line under the title. */
  description?: ReactNode;
  children?: ReactNode;
} & LoadingProps &
  Passthrough): ReactElement {
  const wait = useWait(loading, loadingLabel);
  return (
    <LoadingScope loading={wait.loading}>
      <div {...rest} {...wait.attrs} className="mx-auto w-full max-w-md pt-16">
        <Card>
          <Stack gap="md">
            {mark}
            <PageHeaderContent title={title} description={description} />
            {children}
          </Stack>
        </Card>
        {wait.label}
      </div>
    </LoadingScope>
  );
}
