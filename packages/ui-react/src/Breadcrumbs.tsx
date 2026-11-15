import { isValidElement, type ReactElement, type ReactNode } from "react";
import { cx, focusRing } from "./cx.js";
import { renderLink } from "./link.js";
import type { Passthrough } from "./props.js";

/** The classes of a crumb that links somewhere, for a router's own <Link>. The current page is plain text, not a link. */
export const crumbLinkClass = cx("rounded text-slate-500 hover:underline", focusRing);

/**
 * A crumb that links: `href`, drawn by the app's router link through `LinkProvider` for an in-app
 * path, else a plain `<a>`. `external` opens in a new tab. The last crumb is the current page and is
 * never a link.
 */
export type Crumb = {
  label: ReactNode;
  href: string;
  external?: boolean;
};

function isCrumb(crumb: Crumb | ReactNode): crumb is Crumb {
  return typeof crumb === "object" && crumb !== null && !isValidElement(crumb) && "label" in crumb;
}

function CrumbContent({
  crumb,
  current,
}: {
  crumb: Crumb | ReactNode;
  current: boolean;
}): ReactNode {
  if (!isCrumb(crumb)) return crumb;
  if (current) return crumb.label;
  return renderLink({
    href: crumb.href,
    external: crumb.external,
    className: crumbLinkClass,
    children: crumb.label,
  });
}

/**
 * `org / project / build / snapshot`: each crumb truncates, and the last is the current page. A
 * crumb is a node, or a `Crumb` object when it links.
 */
export function Breadcrumbs({
  items,
  label = "Breadcrumb",
  ...rest
}: {
  /** The trail, first to current: a node, or a `Crumb` (`{ label, href, external? }`) for one that links. The last is the current page and never a link. */
  items: Array<Crumb | ReactNode>;
  /**
   * The trail's accessible name, on its `<nav>`, for an app in another language.
   * @default Breadcrumb
   */
  label?: string | undefined;
} & Passthrough): ReactElement {
  const last = items.length - 1;
  return (
    <nav {...rest} aria-label={label} className="min-w-0">
      <ol className="flex min-w-0 items-center gap-2 text-sm">
        {items.map((crumb, index) => (
          <li
            key={index}
            aria-current={index === last ? "page" : undefined}
            className="flex min-w-0 items-center gap-2"
          >
            {index > 0 && (
              <span aria-hidden="true" className="text-slate-400">
                /
              </span>
            )}
            <span
              className={cx(
                "min-w-0 truncate",
                index === last ? "font-medium text-slate-900" : "text-slate-500",
              )}
            >
              <CrumbContent crumb={crumb} current={index === last} />
            </span>
          </li>
        ))}
      </ol>
    </nav>
  );
}
