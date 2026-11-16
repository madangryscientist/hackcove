import {
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
  type Ref,
  useCallback,
} from "react";
import { cx } from "./cx.js";
import type { Unstyled } from "./props.js";

/**
 * The one content edge: every page's width and side padding. This file is the only place they are
 * defined, so a header, a page and a footer inside a Container start at the same x.
 */
export function Container({ as, ref, children, ...rest }: ContainerProps): ReactElement {
  return (
    <ContainerFrame {...rest} {...(as && { as })} ref={ref}>
      {children}
    </ContainerFrame>
  );
}

type ContainerProps = {
  /**
   * The element: `div`, `main`, `header`, `footer`, `section` or `nav`.
   * @default div
   */
  as?: "div" | "main" | "header" | "footer" | "section" | "nav";
  /** Reaches the rendered element, for a parent that measures or scrolls it. */
  ref?: Ref<HTMLElement> | undefined;
  children?: ReactNode;
} & Unstyled<Omit<HTMLAttributes<HTMLElement>, "children">>;

// The one content edge: px-4 (px-6 from `sm`), or the safe-area inset where a notch or a rounded
// corner is wider (an app with `viewport-fit=cover`; the inset is 0 in an ordinary tab).
const SIDES =
  "mx-auto w-full max-w-6xl pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))] sm:pl-[max(1.5rem,env(safe-area-inset-left))] sm:pr-[max(1.5rem,env(safe-area-inset-right))]";

/** Container with the extra classes its own parts need (AppShell's padding): internal, not exported. */
export function ContainerFrame({
  as: Tag = "div",
  className,
  ref,
  children,
  ...rest
}: ContainerProps & { className?: string }): ReactElement {
  // The tag varies, so the element is handed over by a callback that takes any HTMLElement; a
  // callback ref's cleanup is handed back to React.
  const attach = useCallback(
    (element: HTMLElement | null) => {
      if (typeof ref === "function") return ref(element);
      if (ref) ref.current = element;
      return undefined;
    },
    [ref],
  );
  return (
    <Tag {...rest} ref={attach} className={cx(SIDES, className)}>
      {children}
    </Tag>
  );
}
