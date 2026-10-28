import type { ComponentPropsWithoutRef, ReactElement, ReactNode } from "react";
import { Badge } from "./Badge.js";
import { cx, focusRing } from "./cx.js";
import { type LinkRender, renderLink } from "./link.js";
import type { Unstyled } from "./props.js";
import type { Size } from "./size.js";

export type IconButtonVariant = "outline" | "ghost";
export type IconButtonTone = "default" | "danger";

const BASE = `relative inline-flex items-center justify-center rounded-lg border transition disabled:pointer-events-none disabled:opacity-50 ${focusRing}`;

/** The same heights as a `Button` of the size: 26px, 38px and 46px. */
const SIZE: Record<Size, string> = { sm: "size-6.5", md: "size-9.5", lg: "size-11.5" };

const LOOK: Record<IconButtonTone, Record<IconButtonVariant, string>> = {
  default: {
    outline: "border-slate-200 text-slate-500 hover:bg-slate-50",
    ghost: "border-transparent text-slate-500 hover:bg-slate-100",
  },
  danger: {
    outline: "border-red-200 text-red-700 hover:bg-red-50",
    ghost: "border-transparent text-red-700 hover:bg-red-50",
  },
};

type IconButtonProps = {
  /** The button's accessible name and its tooltip. */
  label: string;
  /**
   * `outline` has a border; `ghost` has none, until the hover fill.
   * @default outline
   */
  variant?: IconButtonVariant | undefined;
  /**
   * `danger` is red, for delete and clear.
   * @default default
   */
  tone?: IconButtonTone | undefined;
  /**
   * The button's height, matching a `Button` or `Input` of the same size.
   * @default md
   */
  size?: Size | undefined;
  /** A red count on the top-right corner, for unread alerts. Not shown at 0; `label` carries it for a screen reader. */
  badge?: number | undefined;
  children: ReactNode;
};

type IconButtonAsButton = IconButtonProps &
  Unstyled<Omit<ComponentPropsWithoutRef<"button">, "children">> & {
    href?: undefined;
    render?: undefined;
    external?: undefined;
  };

type IconButtonAsLink = IconButtonProps & {
  /** Opens in a new tab: adds `target="_blank"` and `rel="noreferrer"`. */
  external?: boolean | undefined;
} & Unstyled<Omit<ComponentPropsWithoutRef<"a">, "href" | "children">> &
  (
    | {
        /** Makes the button a link to this URL. */
        href: string;
        /** Draws the link with the app's own router `<Link>`: `(p) => <Link to="/settings" {...p} />`. */
        render?: LinkRender | undefined;
      }
    | {
        /** Makes the button a link to this URL. */
        href?: string | undefined;
        /** Draws the link with the app's own router `<Link>`: `(p) => <Link to="/settings" {...p} />`. */
        render: LinkRender;
      }
  );

/** The classes for a variant, tone and size, each at its default when left out. */
function look({
  variant = "outline",
  tone = "default",
  size = "md",
}: Pick<IconButtonProps, "variant" | "tone" | "size">): string {
  return cx(BASE, SIZE[size], LOOK[tone][variant]);
}

function isLink(props: IconButtonAsButton | IconButtonAsLink): props is IconButtonAsLink {
  return props.href !== undefined || props.render !== undefined;
}

/**
 * A square button holding one icon. `label` is its accessible name and tooltip. `variant="ghost"`
 * drops the border for a quiet action in a row or a toolbar; `size` matches the height of a
 * `Button` of the same size (`sm` 26px, `md` 38px, `lg` 46px); `tone="danger"` is red, for delete
 * and clear; `badge` pins a red count to the corner. Defaults to `type="button"`. `href` makes it
 * a link instead (a plain `<a>`, or with `render` the app's own router `<Link>`:
 * `render={(p) => <Link to="/settings" {...p} />}`; `external` opens a new tab), with the same look.
 */
export function IconButton(props: IconButtonAsButton | IconButtonAsLink): ReactElement {
  if (isLink(props)) {
    const { label, variant, tone, size, badge, children, ...link } = props;
    return renderLink({
      ...link,
      external: link.external ?? false,
      "aria-label": named(label, badge),
      title: named(label, badge),
      className: look({ variant, tone, size }),
      children: (
        <>
          {children}
          {badge ? <Badge count={badge} corner aria-hidden="true" /> : null}
        </>
      ),
    });
  }
  const { label, variant, tone, size, badge, children, ...rest } = props;
  return (
    <button
      type="button"
      {...rest}
      aria-label={named(label, badge)}
      title={named(label, badge)}
      className={look({ variant, tone, size })}
    >
      {children}
      {badge ? <Badge count={badge} corner aria-hidden="true" /> : null}
    </button>
  );
}

/** The accessible name with its count: `Alerts, 3`. */
function named(label: string, badge: number | undefined): string {
  return badge ? `${label}, ${badge}` : label;
}
