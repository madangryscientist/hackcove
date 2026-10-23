import type { ReactElement, ReactNode } from "react";
import { cx } from "./cx.js";

/**
 * The one content edge: every page's width and side padding. This file is the only place they are
 * defined, so a header, a page and a footer inside a Container start at the same x.
 */
export function Container({
  as: Tag = "div",
  className,
  elementRef,
  children,
}: {
  as?: "div" | "main" | "header" | "footer" | "section" | "nav";
  className?: string;
  /** The rendered element, for a parent that measures or scrolls it. */
  elementRef?: (element: HTMLElement | null) => void;
  children?: ReactNode;
}): ReactElement {
  return (
    <Tag ref={elementRef} className={cx("mx-auto w-full max-w-6xl px-4 sm:px-6", className)}>
      {children}
    </Tag>
  );
}
