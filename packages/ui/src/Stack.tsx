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

export type StackGap = "xs" | "sm" | "md" | "lg" | "section";

export const STACK_GAP: Record<StackGap, string> = {
  xs: "gap-2",
  sm: "gap-4",
  md: "gap-6",
  lg: "gap-8",
  section: "gap-12 sm:gap-16",
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
 * line under it), `sm` inside a group, `md` (default) between blocks, `lg` between groups, `section` between a page's top-level blocks
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
  gap?: StackGap | undefined;
  width?: StackWidth | undefined;
  children?: ReactNode;
};

type StackProps = StackBase &
  (
    | ({ as?: "div" | "section" } & Passthrough)
    | ({ as: "form" } & Unstyled<Omit<ComponentPropsWithoutRef<"form">, "children">>)
    | ({ as: "ul" } & Unstyled<Omit<ComponentPropsWithoutRef<"ul">, "children">>)
    | ({ as: "ol" } & Unstyled<Omit<ComponentPropsWithoutRef<"ol">, "children">>)
  );

/** A `<section>` Stack with an optional `SectionHeading` title (which names it) and `actions` beside it. */
export function Section({
  title,
  actions,
  gap = "sm",
  width,
  children,
  ...rest
}: {
  title?: ReactNode;
  actions?: ReactNode;
  gap?: StackGap | undefined;
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
