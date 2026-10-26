import type { ComponentPropsWithoutRef, ReactElement, ReactNode } from "react";
import { Badge } from "./Badge.js";
import { cx, focusRing } from "./cx.js";
import { type LinkRender, renderLink } from "./link.js";
import type { Unstyled } from "./props.js";

export type IconButtonVariant = "outline" | "ghost";
export type IconButtonTone = "default" | "danger";

const BASE = `relative inline-flex h-9 w-9 items-center justify-center rounded-lg border transition disabled:pointer-events-none disabled:opacity-50 ${focusRing}`;

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
    | { href: string; render?: LinkRender | undefined }
    | { href?: string | undefined; render: LinkRender }
  );

function isLink(props: IconButtonAsButton | IconButtonAsLink): props is IconButtonAsLink {
  return props.href !== undefined || props.render !== undefined;
}

/**
 * A square button holding one icon. `label` is its accessible name and tooltip. `variant="ghost"`
 * drops the border for a quiet action in a row or a toolbar; `tone="danger"` is red, for delete
 * and clear; `badge` pins a red count to the corner. Defaults to `type="button"`. `href` makes it
 * a link instead (a plain `<a>`, or with `render` the app's own router `<Link>`:
 * `render={(p) => <Link to="/settings" {...p} />}`; `external` opens a new tab), with the same look.
 */
export function IconButton(props: IconButtonAsButton | IconButtonAsLink): ReactElement {
  if (isLink(props)) {
    const { label, variant = "outline", tone = "default", badge, children, ...link } = props;
    return renderLink({
      ...link,
      external: link.external ?? false,
      "aria-label": named(label, badge),
      title: named(label, badge),
      className: cx(BASE, LOOK[tone][variant]),
      children: (
        <>
          {children}
          {badge ? <Badge count={badge} corner aria-hidden="true" /> : null}
        </>
      ),
    });
  }
  const { label, variant = "outline", tone = "default", badge, children, ...rest } = props;
  return (
    <button
      type="button"
      {...rest}
      aria-label={named(label, badge)}
      title={named(label, badge)}
      className={cx(BASE, LOOK[tone][variant])}
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
