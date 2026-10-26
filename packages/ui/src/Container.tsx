import type { HTMLAttributes, ReactElement, ReactNode } from "react";
import { cx } from "./cx.js";
import type { Unstyled } from "./props.js";

/**
 * The one content edge: every page's width and side padding. This file is the only place they are
 * defined, so a header, a page and a footer inside a Container start at the same x.
 */
export function Container({ as, elementRef, children, ...rest }: ContainerProps): ReactElement {
  return (
    <ContainerFrame {...rest} {...(as && { as })} elementRef={elementRef}>
      {children}
    </ContainerFrame>
  );
}

type ContainerProps = {
  as?: "div" | "main" | "header" | "footer" | "section" | "nav";
  /** The rendered element, for a parent that measures or scrolls it. */
  elementRef?: ((element: HTMLElement | null) => void) | undefined;
  children?: ReactNode;
} & Unstyled<Omit<HTMLAttributes<HTMLElement>, "children">>;

/** Container with the extra classes its own parts need (AppShell's padding): internal, not exported. */
export function ContainerFrame({
  as: Tag = "div",
  className,
  elementRef,
  children,
  ...rest
}: ContainerProps & { className?: string }): ReactElement {
  return (
    <Tag
      {...rest}
      ref={elementRef}
      className={cx("mx-auto w-full max-w-6xl px-4 sm:px-6", className)}
    >
      {children}
    </Tag>
  );
}
