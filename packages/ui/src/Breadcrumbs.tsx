import { isValidElement, type ReactElement, type ReactNode } from "react";
import { cx, focusRing } from "./cx.js";
import { type LinkRender, renderLink } from "./link.js";
import type { Passthrough } from "./props.js";

/** The classes of a crumb that links somewhere, for a router's own <Link>. The current page is plain text, not a link. */
export const crumbLinkClass = cx("rounded text-slate-500 hover:underline", focusRing);

/**
 * A crumb that links: a plain `<a href>`, or with `render` the app's own router `<Link>`
 * (`render: (p) => <Link to="/quotes" {...p} />`; `href` is then not used). `external` opens in a
 * new tab. The last crumb is the current page and is never a link.
 */
export type Crumb = {
  label: ReactNode;
  external?: boolean;
} & ({ href: string; render?: LinkRender } | { href?: string; render: LinkRender });

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
    render: crumb.render,
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
  crumbs,
  ...rest
}: { crumbs: Array<Crumb | ReactNode> } & Passthrough): ReactElement {
  const last = crumbs.length - 1;
  return (
    <nav {...rest} aria-label="Breadcrumb" className="min-w-0">
      <ol className="flex min-w-0 items-center gap-2 text-sm">
        {crumbs.map((crumb, index) => (
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
