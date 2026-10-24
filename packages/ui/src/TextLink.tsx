import type { ComponentPropsWithoutRef, ReactElement } from "react";
import { cx, focusRing } from "./cx.js";
import { type LinkRender, renderLink } from "./link.js";

/** The classes of an inline text link, for a router's own <Link> that should look like one. */
export const linkClass = cx(
  "rounded font-medium text-violet-600 underline-offset-2 transition-colors hover:text-violet-700",
  focusRing,
);

/**
 * Stretches a link's hit area over its nearest `relative` ancestor (a table row, a card), so the
 * whole of it opens the link. Add it to the one link in the row; the ancestor needs `relative`.
 */
export const linkStretchClass = "after:absolute after:inset-0";

type TextLinkProps = {
  /** Opens in a new tab: adds `target="_blank"` and `rel="noreferrer"`. */
  external?: boolean | undefined;
  /** The link covers its nearest `relative` ancestor, so the whole row or card is the click target. */
  stretch?: boolean | undefined;
} & Omit<ComponentPropsWithoutRef<"a">, "href"> &
  (
    | { href: string; render?: LinkRender | undefined }
    | { href?: string | undefined; render: LinkRender }
  );

/**
 * An inline text link in the accent colour. Every anchor prop goes on the `<a>`. With `render` it
 * draws the app's own router `<Link>` instead (`render={(p) => <Link to="/terms" {...p} />}`).
 */
export function TextLink({
  external = false,
  stretch = false,
  href,
  render,
  className,
  children,
  ...rest
}: TextLinkProps): ReactElement {
  return renderLink({
    ...rest,
    href,
    render,
    external,
    className: cx(linkClass, stretch && linkStretchClass, className),
    children,
  });
}
