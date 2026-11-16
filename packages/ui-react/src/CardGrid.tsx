import { Children, isValidElement, type ReactElement, type ReactNode } from "react";
import { Card } from "./Card.js";
import { cx } from "./cx.js";
import { EmptySlot, hasNoChildren } from "./emptySlot.js";
import { useWait } from "./layoutWait.js";
import type { Passthrough } from "./props.js";
import { type LoadingProps, LoadingScope } from "./skeleton.js";

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
  /** Drawn in place of the grid when there are no children: an `EmptyState`. */
  empty?: ReactNode;
  children?: ReactNode;
} & LoadingProps &
  Passthrough;

function gridColumns(
  columns: keyof typeof COLUMNS | "auto",
  minWidth: keyof typeof AUTO_MIN_WIDTH,
): string {
  if (columns === "auto") return AUTO_MIN_WIDTH[minWidth];
  return cx("grid-cols-1 sm:grid-cols-2", COLUMNS[columns]);
}

/**
 * A responsive grid of tiles of one width: one column on a phone, two from `sm`, `columns` from `lg`.
 * A main area beside a narrower one is not a grid of tiles: it is `SideColumn` (`asideWidth="third"`
 * for two thirds and one). `columns="auto"` instead fits as many per row as the width allows, each at least `minWidth` wide:
 * `md` (17rem, the default) or `sm` (12rem). `align="start"` keeps each card its own height
 * instead of stretching it to the tallest in its row. `as="ul"` makes it a list of cards for a
 * screen reader: the grid is a `<ul>` and each child is wrapped in an `<li>`, still stretched.
 * With no children it draws `empty` (an `EmptyState`) in place of the grid. While `loading` with
 * none it draws one card of bones per column (three for `auto`), never `empty`.
 */
export function CardGrid({
  columns = 3,
  minWidth = "md",
  align = "stretch",
  as: Tag = "div",
  empty,
  children,
  loading,
  loadingLabel,
  ...rest
}: CardGridProps): ReactElement {
  const wait = useWait(loading, loadingLabel);
  const none = hasNoChildren(children);
  if (none && !wait.loading) {
    return <EmptySlot size="md">{empty}</EmptySlot>;
  }
  const cards = none ? gridBones(columns) : children;
  return (
    <LoadingScope loading={wait.loading}>
      <Tag
        {...rest}
        {...wait.attrs}
        {...(Tag === "ul" ? { role: "list" } : {})}
        className={cx(
          "grid gap-4",
          gridColumns(columns, minWidth),
          align === "start" && "items-start",
        )}
      >
        <GridItems list={Tag === "ul"} owner={wait.attrs["aria-busy"] === true} label={wait.label}>
          {cards}
        </GridItems>
      </Tag>
    </LoadingScope>
  );
}

/** A loading grid's cards when it has none yet: one card of bones per column, three for `auto`. */
function gridBones(columns: keyof typeof COLUMNS | "auto"): ReactElement[] {
  return Array.from({ length: columns === "auto" ? 3 : columns }, (_, i) => (
    <Card key={i}>{null}</Card>
  ));
}

/** The grid's cards, each in an `<li>` for a list, then the owner's hidden label (in an `<li>` too). */
function GridItems({
  list,
  owner,
  label,
  children,
}: {
  list: boolean;
  owner: boolean;
  label: ReactElement;
  children: ReactNode;
}): ReactElement {
  if (!list) {
    return (
      <>
        {children}
        {label}
      </>
    );
  }
  return (
    <>
      {Children.toArray(children).map((child, index) => (
        // A grid, so the one child (a Card) fills the item's height as it does in a plain grid.
        <li key={isValidElement(child) ? child.key : index} className="grid">
          {child}
        </li>
      ))}
      {owner && <li className="sr-only">{label}</li>}
    </>
  );
}
