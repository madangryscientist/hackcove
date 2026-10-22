import type { ReactElement, ReactNode } from "react";
import { cx, focusRing } from "./cx.js";

/** The classes of a crumb that links somewhere, for a router's own <Link>. The current page is plain text, not a link. */
export const crumbLinkClass = cx("rounded text-slate-500 hover:underline", focusRing);

/** `org / project / build / snapshot`: each crumb truncates, and the last is the current page. */
export function Breadcrumbs({
  crumbs,
  className,
}: {
  crumbs: ReactNode[];
  className?: string;
}): ReactElement {
  const last = crumbs.length - 1;
  return (
    <nav aria-label="Breadcrumb" className={cx("min-w-0", className)}>
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
              className={cx("min-w-0 truncate", index === last && "font-medium text-slate-900")}
            >
              {crumb}
            </span>
          </li>
        ))}
      </ol>
    </nav>
  );
}
