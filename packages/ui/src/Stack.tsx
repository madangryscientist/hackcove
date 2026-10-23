import { useId, type ReactElement, type ReactNode } from "react";
import { cx } from "./cx.js";
import { SectionHeading } from "./typography.js";

export type StackGap = "sm" | "md" | "lg";

const GAP: Record<StackGap, string> = { sm: "gap-4", md: "gap-6", lg: "gap-8" };

/** A vertical column of blocks a fixed `gap` apart: `sm` inside a group, `md` (default) between blocks, `lg` between groups. */
export function Stack({
  gap = "md",
  as: Tag = "div",
  className,
  children,
  ...rest
}: {
  gap?: StackGap;
  as?: "div" | "section";
  className?: string | undefined;
  children?: ReactNode;
  "aria-labelledby"?: string | undefined;
}): ReactElement {
  return (
    <Tag className={cx("flex flex-col", GAP[gap], className)} {...rest}>
      {children}
    </Tag>
  );
}

/** A `<section>` Stack with an optional `SectionHeading` title (which names it) and `actions` beside it. */
export function Section({
  title,
  actions,
  gap = "sm",
  className,
  children,
}: {
  title?: ReactNode;
  actions?: ReactNode;
  gap?: StackGap;
  className?: string;
  children?: ReactNode;
}): ReactElement {
  const titleId = useId();
  return (
    <Stack
      as="section"
      gap={gap}
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
