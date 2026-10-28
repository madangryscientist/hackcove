import {
  useId,
  type ComponentPropsWithoutRef,
  type ElementType,
  type ReactElement,
  type ReactNode,
} from "react";
import { cx } from "./cx.js";
import type { Passthrough, Unstyled } from "./props.js";
import { SectionHeading } from "./typography.js";

export type StackGap = "xs" | "sm" | "md" | "lg" | "xl";

export const STACK_GAP: Record<StackGap, string> = {
  xs: "gap-2",
  sm: "gap-4",
  md: "gap-6",
  lg: "gap-8",
  xl: "gap-12 sm:gap-16",
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
 * line under it), `sm` inside a group, `md` (default) between blocks, `lg` between groups, `xl` between a page's top-level blocks
 * (`gap-12`, `sm:gap-16`: the one responsive page rhythm).
 *
 * `width` caps the column: `narrow` is a reading measure (`max-w-3xl`), `wide` is `max-w-5xl`, `full`
 * is the parent's whole width and `default` sets nothing. A capped Stack starts at its parent's left
 * edge (it is never re-centred), so its first line lines up with every other block on the page.
 *
 * `as` is a closed set: `div` (default), `section`, `form`, `ul` or `ol`. A `form` takes the form
 * props (`onSubmit`, `action`, `method`, `noValidate`, ...). A `ul` or `ol` is drawn with no
 * markers and its children are `<li>`s, as in `BulletList` and `Timeline`: the Stack does not wrap
 * them, so a child is one list item and `Body as="li"` or a bare `<li>` both work.
 */
export function Stack({
  gap = "md",
  width = "default",
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
        STACK_GAP[gap],
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
   * @default md
   */
  gap?: StackGap | undefined;
  /**
   * Caps the column: `narrow` max-w-3xl (a reading measure), `wide` max-w-5xl, `full` the parent's whole width, `default` sets nothing.
   * @default default
   */
  width?: StackWidth | undefined;
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

/**
 * A `<section>` Stack with an optional `SectionHeading` title (which names it) and `actions` beside
 * it. Its blocks are `gap` apart, `md` by default as in a `Stack`.
 */
export function Section({
  title,
  actions,
  gap = "md",
  width = "default",
  children,
  ...rest
}: {
  /** A `SectionHeading` at the top, which names the section. */
  title?: ReactNode;
  /** Buttons or links at the end of the title row. */
  actions?: ReactNode;
  /**
   * The space between blocks: `xs` gap-2, `sm` gap-4, `md` gap-6, `lg` gap-8, `xl` gap-12 (gap-16 from `sm`).
   * @default md
   */
  gap?: StackGap | undefined;
  /**
   * Caps the column: `narrow` max-w-3xl (a reading measure), `wide` max-w-5xl, `full` the parent's whole width, `default` sets nothing.
   * @default default
   */
  width?: StackWidth | undefined;
  children?: ReactNode;
} & Passthrough): ReactElement {
  const titleId = useId();
  return (
    <Stack
      as="section"
      {...rest}
      gap={gap}
      width={width}
      aria-labelledby={title ? titleId : rest["aria-labelledby"]}
    >
      {(title || actions) && (
        <div className="flex items-center justify-between gap-4">
          {title && <SectionHeading id={titleId}>{title}</SectionHeading>}
          {actions && <div className="ml-auto flex items-center gap-2">{actions}</div>}
        </div>
      )}
      {children}
    </Stack>
  );
}
