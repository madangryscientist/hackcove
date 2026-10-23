import type { ComponentPropsWithoutRef, ReactElement } from "react";
import { cx, focusRing } from "./cx.js";

/** The classes of an inline text link, for a router's own <Link> that should look like one. */
export const linkClass = cx(
  "rounded font-medium text-violet-600 underline-offset-2 transition-colors hover:text-violet-700",
  focusRing,
);

type TextLinkProps = {
  /** Opens in a new tab: adds `target="_blank"` and `rel="noreferrer"`. */
  external?: boolean | undefined;
} & ComponentPropsWithoutRef<"a"> & { href: string };

/** An inline text link in the accent colour. Every anchor prop goes on the `<a>`. */
export function TextLink({
  external = false,
  className,
  children,
  ...rest
}: TextLinkProps): ReactElement {
  return (
    <a
      className={cx(linkClass, className)}
      {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
      {...rest}
    >
      {children}
    </a>
  );
}
