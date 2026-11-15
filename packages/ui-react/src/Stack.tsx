import {
  useId,
  type ComponentPropsWithoutRef,
  type ElementType,
  type ReactElement,
  type ReactNode,
} from "react";
import { cx } from "./cx.js";
import { type HeadingLevel, HeadingLevelProvider, useHeadingLevel } from "./headingLevel.js";
import type { Passthrough, Unstyled } from "./props.js";
import { useStackGap } from "./stackGap.js";
import { SectionHeading } from "./typography.js";

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

export type StackWidth = "narrow" | "default" | "wide" | "full";

/** `default` adds nothing: the Stack is as wide as its parent. */
export const STACK_WIDTH: Record<StackWidth, string | undefined> = {
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
 * `width` caps the column: `narrow` is a reading measure (`max-w-3xl`), `wide` is `max-w-5xl`, `full`
 * is the parent's whole width and `default` sets nothing. A capped Stack starts at its parent's left
 * edge (it is never re-centred), so its first line lines up with every other block on the page.
 *
 * `rowFrom` turns the column into a row from `sm`, `md` or `lg` (a column below it): the blocks sit
 * side by side, `gap` apart, and a `ClusterGrow` around one of them takes the width left. Without it the
 * Stack is always a column; a row that is a row at every width is a `Cluster`.
 *
 * `as` is a closed set: `div` (default), `section`, `form`, `ul` or `ol`. A `form` takes the form
 * props (`onSubmit`, `action`, `method`, `noValidate`, ...). A `ul` or `ol` is drawn with no
 * markers and its children are `<li>`s, as in `BulletList` and `Timeline`: the Stack does not wrap
 * them, so a child is one list item and `Text as="li"` or a bare `<li>` both work.
 */
export function Stack({
  gap,
  width = "default",
  rowFrom,
  as = "div",
  children,
  ...rest
}: StackProps): ReactElement {
  return (
    <Box
      tag={as}
      className={cx(
        "flex flex-col",
        (as === "ul" || as === "ol") && "list-none",
        rowFrom && STACK_ROW_FROM[rowFrom],
        STACK_GAP[useStackGap(gap)],
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

type StackBase = {
  /**
   * The space between blocks: `xs` gap-2, `sm` gap-4, `md` gap-6, `lg` gap-8, `xl` gap-12 (gap-16 from `sm`).
   * @default xs inside a `Card`, `Dialog`, `Drawer`, `BottomSheet`, `Callout` or `ListRow`, else md
   */
  gap?: StackGap | undefined;
  /**
   * Caps the column: `narrow` max-w-3xl (a reading measure), `wide` max-w-5xl, `full` the parent's whole width, `default` sets nothing.
   * @default default
   */
  width?: StackWidth | undefined;
  /**
   * Turns the column into a row from this breakpoint (`sm`, `md` or `lg`), a column below it: a main
   * area beside a side column on a wide screen, stacked on a phone. In the row the blocks sit side by side
   * the same `gap` apart and are as tall as the tallest; wrap the one that takes the width left in a
   * `ClusterGrow`. Left out, the Stack is always a column.
   */
  rowFrom?: StackRowFrom | undefined;
  children?: ReactNode;
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
      } & Unstyled<Omit<ComponentPropsWithoutRef<"ul">, "children">>)
    | ({
        /** The element: `div`, `section`, `form` (takes the form's props), `ul` or `ol` (no markers; each child is an `<li>`). */
        as: "ol";
      } & Unstyled<Omit<ComponentPropsWithoutRef<"ol">, "children">>)
  );

/** The id a `Section`'s heading takes: the caller's, or one of React's. */
function useHeadingId(id: string | undefined): string {
  const generated = useId();
  return id ?? generated;
}

/**
 * A `<section>` Stack with an optional `SectionHeading` title (which names it) and `actions` beside
 * it. Its blocks are `gap` apart, from where it sits as in a `Stack`. `rule` draws a hairline under the
 * title row, `actions` included, as `SectionHeading`'s `rule` does for a bare heading. A line
 * between two sections is a `Divider` in the `Stack` that holds them. `level` is the title's
 * heading level, one below the heading that holds the section (an `h2` on the page), and a heading
 * inside it (a `Card`'s title) is one below that.
 */
export function Section({
  id,
  title,
  actions,
  rule = false,
  level,
  gap,
  width = "default",
  children,
  ...rest
}: {
  /**
   * Makes the section a link target: `#<id>` scrolls to its heading, which stops below the sticky
   * AppShell header. Needs a `title`: with no title the heading that carries it is not rendered.
   */
  id?: string | undefined;
  /** A `SectionHeading` at the top, which names the section. */
  title?: ReactNode;
  /** Buttons or links at the end of the title row. */
  actions?: ReactNode;
  /**
   * A hairline under the title row across the section's width, `actions` included. Needs a `title`
   * or `actions`.
   * @default false
   */
  rule?: boolean | undefined;
  /**
   * The title's heading level, 2 to 6. It does not change how the title looks.
   * @default one below the heading that holds the section: 2 on the page
   */
  level?: HeadingLevel | undefined;
  /**
   * The space between blocks: `xs` gap-2, `sm` gap-4, `md` gap-6, `lg` gap-8, `xl` gap-12 (gap-16 from `sm`).
   * @default xs inside a `Card`, `Dialog`, `Drawer`, `BottomSheet`, `Callout` or `ListRow`, else md
   */
  gap?: StackGap | undefined;
  /**
   * Caps the column: `narrow` max-w-3xl (a reading measure), `wide` max-w-5xl, `full` the parent's whole width, `default` sets nothing.
   * @default default
   */
  width?: StackWidth | undefined;
  children?: ReactNode;
} & Passthrough): ReactElement {
  const titleId = useHeadingId(id);
  const own = useHeadingLevel(level);
  return (
    <Stack
      as="section"
      {...rest}
      gap={gap}
      width={width}
      aria-labelledby={title ? titleId : rest["aria-labelledby"]}
    >
      {(title || actions) && (
        <div
          className={cx(
            "flex items-center justify-between gap-4",
            rule && "border-b border-slate-200/70 pb-2",
          )}
        >
          {title && (
            <SectionHeading as={`h${own}`} id={titleId}>
              {title}
            </SectionHeading>
          )}
          {actions && <div className="ml-auto flex items-center gap-2">{actions}</div>}
        </div>
      )}
      {title ? <HeadingLevelProvider level={own}>{children}</HeadingLevelProvider> : children}
    </Stack>
  );
}
