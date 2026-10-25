import type { ComponentPropsWithoutRef, ReactElement } from "react";
import { buttonClass, type ButtonLook } from "./Button.js";
import { type LinkRender, renderLink } from "./link.js";
import type { Unstyled } from "./props.js";

type ButtonLinkProps = ButtonLook & {
  /** Opens in a new tab: adds `target="_blank"` and `rel="noreferrer"`. */
  external?: boolean | undefined;
} & Unstyled<Omit<ComponentPropsWithoutRef<"a">, "href">> &
  (
    | { href: string; render?: LinkRender | undefined }
    | { href?: string | undefined; render: LinkRender }
  );

/**
 * A link that looks like a Button. A plain `<a href>` by default; with `render` it draws the app's
 * own router `<Link>` instead (`render={(p) => <Link to="/quotes" {...p} />}`), already carrying the
 * button classes. `variant`, `size` and `tone` are the Button's.
 */
export function ButtonLink({
  variant = "primary",
  size = "md",
  tone = "default",
  href,
  render,
  external = false,
  children,
  ...rest
}: ButtonLinkProps): ReactElement {
  return renderLink({
    ...rest,
    href,
    render,
    external,
    className: buttonClass(variant, { size, tone }),
    children,
  });
}
