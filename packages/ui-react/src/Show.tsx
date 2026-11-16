import type { ReactElement, ReactNode } from "react";
import type { Passthrough } from "./props.js";

/** A width step: `sm` 640px, `md` 768px, `lg` 1024px. */
export type Breakpoint = "sm" | "md" | "lg";

// Each class is written out whole, so Tailwind sees it. Shown is `display: contents`, so the wrapper
// adds no box and its children sit in the parent's row, grid or Stack, spaced by its gap.
const FROM: Record<Breakpoint, string> = {
  sm: "hidden sm:contents",
  md: "hidden md:contents",
  lg: "hidden lg:contents",
};

const BELOW: Record<Breakpoint, string> = {
  sm: "contents sm:hidden",
  md: "contents md:hidden",
  lg: "contents lg:hidden",
};

type ShowWhen =
  | {
      /** Shown from this width up, gone below it. */
      from: Breakpoint;
      below?: never;
    }
  | {
      /** Shown below this width, gone from it up. */
      below: Breakpoint;
      from?: never;
    };

/**
 * Shows its children only from a width up (`from`) or only below it (`below`), by CSS alone: the
 * same markup on the server and the client, with no script. Hidden is `display: none`, so the
 * content is out of the accessibility tree and the tab order too. Shown, the wrapper adds no box,
 * so the children sit in the parent's row, grid or Stack and take its gap.
 *
 * Content that only fits a wide screen is in a `Show from`; its narrow-screen form is in a
 * `Show below` at the same breakpoint. Hidden content stays mounted, so two `Show`s of the same
 * content mount it twice: a stateful panel shown at every width with a fold is a
 * `SideColumn asideLabel`. `as="span"` is for phrasing content (inside a `<p>` or a button row).
 */
export function Show({
  from,
  below,
  as: Tag = "div",
  children,
  ...rest
}: ShowWhen & {
  /**
   * The element: `div`, or `span` inside phrasing content.
   * @default div
   */
  as?: "div" | "span" | undefined;
  children: ReactNode;
} & Passthrough): ReactElement {
  return (
    <Tag {...rest} className={from ? FROM[from] : BELOW[below ?? "sm"]}>
      {children}
    </Tag>
  );
}
