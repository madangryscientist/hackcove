import type { ComponentPropsWithoutRef, ReactElement } from "react";
import { cx, focusRing } from "./cx.js";
import { type LinkRender, renderLink } from "./link.js";
import type { Unstyled } from "./props.js";
import { TEXT_TONE, type TextTone } from "./typography.js";

const LINK = "rounded font-medium underline-offset-2 transition-colors";

/** The classes of an inline text link, for a router's own <Link> that should look like one. */
export const linkClass = cx(LINK, "text-violet-600 hover:text-violet-700", focusRing);

// A toned link takes its tone's text colour, shared with Table's cells and the inline roles, and
// underlines on hover in place of a hover shade.
const toneClass = (tone: TextTone): string =>
  cx(LINK, TEXT_TONE[tone], "hover:underline", focusRing);

/**
 * Stretches a link's hit area over its nearest `relative` ancestor (a table row, a card), so the
 * whole of it opens the link. Add it to the one link in the row; the ancestor needs `relative`.
 */
export const linkStretchClass = "after:absolute after:inset-0";

export type TextLinkSize = "xs" | "sm";

const SIZE: Record<TextLinkSize, string> = {
  xs: "text-xs/4",
  sm: "text-sm/5",
};

type TextLinkProps = {
  /** The link's own type size. Left out, it takes the size of the text around it. */
  size?: TextLinkSize | undefined;
  /**
   * A meaning's colour, as on the inline roles: `warn` for a warning link, `danger`, `positive`,
   * `info` or `muted`. Left out, the link is the accent colour.
   */
  tone?: TextTone | undefined;
  /** The monospace face, for a path, an id or a command. */
  mono?: boolean | undefined;
  /** Opens in a new tab: adds `target="_blank"` and `rel="noreferrer"`. */
  external?: boolean | undefined;
  /** The link covers its nearest `relative` ancestor, so the whole row or card is the click target. */
  stretch?: boolean | undefined;
} & Unstyled<Omit<ComponentPropsWithoutRef<"a">, "href">> &
  (
    | { href: string; render?: LinkRender | undefined }
    | { href?: string | undefined; render: LinkRender }
  );

/**
 * An inline text link in the accent colour. Every anchor prop goes on the `<a>`. With `render` it
 * draws the app's own router `<Link>` instead (`render={(p) => <Link to="/terms" {...p} />}`).
 * `size` pins the type size (`xs` or `sm`), `tone` gives it a meaning's colour and `mono` sets the
 * monospace face.
 */
export function TextLink({
  size,
  tone,
  mono = false,
  external = false,
  stretch = false,
  href,
  render,
  children,
  ...rest
}: TextLinkProps): ReactElement {
  return renderLink({
    ...rest,
    href,
    render,
    external,
    className: cx(
      tone ? toneClass(tone) : linkClass,
      size && SIZE[size],
      mono && "font-mono",
      stretch && linkStretchClass,
    ),
    children,
  });
}
