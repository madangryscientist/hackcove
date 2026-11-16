import {
  type ComponentPropsWithoutRef,
  type ElementType,
  type ReactElement,
  type ReactNode,
} from "react";
import { cx } from "./cx.js";
import type { Passthrough, Unstyled } from "./props.js";
import { useStackGap } from "./stackGap.js";
import { EmptySlot, hasNoChildren } from "./emptySlot.js";

export type StackGap = "xs" | "sm" | "md" | "lg" | "xl";

export const STACK_GAP: Record<StackGap, string> = {
  xs: "gap-2",
  sm: "gap-4",
  md: "gap-6",
  lg: "gap-8",
  xl: "gap-12 sm:gap-16",
};

export type StackRowFrom = "sm" | "md" | "lg";

/** The breakpoint where a `rowFrom` Stack turns from a column into a row. */
export const STACK_ROW_FROM: Record<StackRowFrom, string> = {
  sm: "sm:flex-row",
  md: "md:flex-row",
  lg: "lg:flex-row",
};

export type StackWidth = "compact" | "narrow" | "default" | "wide" | "full";

/** `default` adds nothing: the Stack is as wide as its parent. */
export const STACK_WIDTH: Record<StackWidth, string | undefined> = {
  compact: "max-w-md",
  narrow: "max-w-3xl",
  default: undefined,
  wide: "max-w-5xl",
  full: "w-full",
};

/**
 * A vertical column of blocks a fixed `gap` apart: `xs` between lines of text (a heading and the
 * line under it), `sm` inside a group, `md` between blocks, `lg` between groups, `xl` between a page's top-level blocks
 * (`gap-12`, `sm:gap-16`: the one responsive page rhythm). Left out, the gap comes from where the
 * Stack sits: `xs` inside a `Card`, `Dialog`, `Drawer`, `BottomSheet`, `Callout` or `ListRow`, and
 * `md` on the page.
 *
 * `width` caps the column: `compact` is the width of one card or one picture's column (28rem),
 * `narrow` is a reading measure, `wide` is wider again, `full` is the parent's whole width and
 * `default` sets nothing. A capped Stack starts at its parent's left edge (it is never re-centred),
 * so its first line lines up with every other block on the page. A width cap on any one block (a
 * `Card`, an `Image`) is a Stack around it.
 *
 * `align="start"` keeps each child at its own width, capped at the column's (a `Button` under a
 * form's fields); left out, every child spans the column.
 *
 * `divided` draws a line between each pair of children and sets them touching, with no gap: it is
 * for rows that carry their own padding (`ListRow`s in a `Card flush`). Space and a line between
 * blocks is a `Divider` in the Stack instead.
 *
 * `rowFrom` turns the column into a row from `sm`, `md` or `lg` (a column below it): the blocks sit
 * side by side, `gap` apart, and a `ClusterGrow` around one of them takes the width left. Without it the
 * Stack is always a column; a row that is a row at every width is a `Cluster`.
 *
 * `as` is a closed set: `div` (default), `section`, `form`, `ul` or `ol`. A `form` takes the form
 * props (`onSubmit`, `action`, `method`, `noValidate`, ...). A `ul` or `ol` is drawn with no
 * markers and its children are `<li>`s, as in `BulletList` and `Timeline`: the Stack does not wrap
 * them, so a child is one list item and `Text as="li"` or a bare `<li>` both work. A `ul` or `ol`
 * takes `empty` (an `EmptyState`, one muted line here), drawn in place of the list when it has no
 * children.
 */
export function Stack(props: StackProps): ReactElement {
  const { empty, ...rest } = { empty: undefined, ...props };
  if ((rest.as === "ul" || rest.as === "ol") && empty != null && hasNoChildren(rest.children)) {
    return <EmptySlot size="sm">{empty}</EmptySlot>;
  }
  return <StackList {...rest} />;
}

/** The Stack itself, once its empty slot is settled. */
function StackList({
  gap,
  width = "default",
  rowFrom,
  align = "stretch",
  divided = false,
  as = "div",
  children,
  ...rest
}: Omit<StackProps, "empty">): ReactElement {
  const spacing = STACK_GAP[useStackGap(gap)];
  return (
    <Box
      tag={as}
      className={cx(
        "flex flex-col",
        (as === "ul" || as === "ol") && "list-none",
        rowFrom && STACK_ROW_FROM[rowFrom],
        // The line colour sits on the Stack and each row after the first inherits it, so the
        // theme's remap of the one line utility reaches every line.
        divided ? "border-slate-200/70 *:not-first:border-t *:not-first:border-inherit" : spacing,
        align === "start" && "items-start *:max-w-full",
        STACK_WIDTH[width],
        "*:data-page-header:mb-0",
      )}
      {...rest}
    >
      {children}
    </Box>
  );
}

/** The element `as` picked, drawn with props already narrowed by `StackProps`. */
function Box({
  tag: Tag,
  ...props
}: { tag: ElementType; className: string; children: ReactNode } & Record<string, unknown>) {
  return <Tag {...props} />;
}

/** Where a Stack's children sit across the column: `stretch` spans it, `start` keeps each child's own width. */
export type StackAlign = "stretch" | "start";

type StackBase = {
  /**
   * Caps the column: `compact` max-w-md (one card or one picture's column), `narrow` max-w-3xl (a
   * reading measure), `wide` max-w-5xl, `full` the parent's whole width, `default` sets nothing.
   * @default default
   */
  width?: StackWidth | undefined;
  /**
   * Where the children sit across the column: `stretch` spans it, `start` keeps each child at its
   * own width (a `Button` under a form's fields).
   * @default stretch
   */
  align?: StackAlign | undefined;
  children?: ReactNode;
} & (StackSpaced | StackDivided);

/** A Stack whose blocks are a gap apart. */
type StackSpaced = {
  /**
   * The space between blocks: `xs` gap-2, `sm` gap-4, `md` gap-6, `lg` gap-8, `xl` gap-12 (gap-16 from `sm`).
   * @default xs inside a `Card`, `Dialog`, `Drawer`, `BottomSheet`, `Callout` or `ListRow`, else md
   */
  gap?: StackGap | undefined;
  /**
   * A line between each pair of children, which then touch (no gap): rows that carry their own
   * padding. Space and a line between blocks is a `Divider` in the Stack instead.
   */
  divided?: false | undefined;
  /**
   * Turns the column into a row from this breakpoint (`sm`, `md` or `lg`), a column below it: a main
   * area beside a side column on a wide screen, stacked on a phone. In the row the blocks sit side by side
   * the same `gap` apart and are as tall as the tallest; wrap the one that takes the width left in a
   * `ClusterGrow`. Left out, the Stack is always a column.
   */
  rowFrom?: StackRowFrom | undefined;
};

/** A Stack of rows with a line between each pair and no gap. */
type StackDivided = {
  /**
   * A line between each pair of children, which then touch (no gap): rows that carry their own
   * padding. Space and a line between blocks is a `Divider` in the Stack instead.
   */
  divided: true;
  gap?: never;
  rowFrom?: never;
};

type StackProps = StackBase &
  (
    | ({
        /** The element: `div`, `section`, `form` (takes the form's props), `ul` or `ol` (no markers; each child is an `<li>`). */
        as?: "div" | "section";
      } & Passthrough)
    | ({
        /** The element: `div`, `section`, `form` (takes the form's props), `ul` or `ol` (no markers; each child is an `<li>`). */
        as: "form";
      } & Unstyled<Omit<ComponentPropsWithoutRef<"form">, "children">>)
    | ({
        /** The element: `div`, `section`, `form` (takes the form's props), `ul` or `ol` (no markers; each child is an `<li>`). */
        as: "ul";
        /** Drawn in place of the list when it has no children: an `EmptyState`. */
        empty?: ReactNode;
      } & Unstyled<Omit<ComponentPropsWithoutRef<"ul">, "children">>)
    | ({
        /** The element: `div`, `section`, `form` (takes the form's props), `ul` or `ol` (no markers; each child is an `<li>`). */
        as: "ol";
        /** Drawn in place of the list when it has no children: an `EmptyState`. */
        empty?: ReactNode;
      } & Unstyled<Omit<ComponentPropsWithoutRef<"ol">, "children">>)
  );
