import { useId, type ReactElement, type ReactNode } from "react";
import { cx } from "./cx.js";
import { SectionHeading } from "./typography.js";

export type StackGap = "xs" | "sm" | "md" | "lg" | "section";

const GAP: Record<StackGap, string> = {
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
 */
export function Stack({
  gap = "md",
  width = "default",
  as: Tag = "div",
  className,
  children,
  ...rest
}: {
  gap?: StackGap | undefined;
  width?: StackWidth | undefined;
  as?: "div" | "section";
  className?: string | undefined;
  children?: ReactNode;
  "aria-labelledby"?: string | undefined;
}): ReactElement {
  return (
    <Tag className={cx("flex flex-col", GAP[gap], STACK_WIDTH[width], className)} {...rest}>
      {children}
    </Tag>
  );
}

/** A `<section>` Stack with an optional `SectionHeading` title (which names it) and `actions` beside it. */
export function Section({
  title,
  actions,
  gap = "sm",
  width,
  className,
  children,
}: {
  title?: ReactNode;
  actions?: ReactNode;
  gap?: StackGap | undefined;
  width?: StackWidth | undefined;
  className?: string;
  children?: ReactNode;
}): ReactElement {
  const titleId = useId();
  return (
    <Stack
      as="section"
      gap={gap}
      width={width}
      className={className}
      aria-labelledby={title ? titleId : undefined}
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
