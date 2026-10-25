import type { ReactElement, ReactNode } from "react";
import { PageHeading, Subtitle } from "./typography.js";

export type PageHeaderProps = {
  /** A `Breadcrumbs` above the title. */
  breadcrumbs?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  /** Right of the title on `sm` and up, below it on a phone. */
  actions?: ReactNode;
  /** A `NavTabs` (or similar) under the title. */
  tabs?: ReactNode;
};

/** The header block without its bottom margin; PageHeader adds the margin (a `Stack` child drops it), PageTitle does not. */
export function PageHeaderContent({
  breadcrumbs,
  title,
  subtitle,
  actions,
  tabs,
  className,
}: PageHeaderProps & { className?: string }): ReactElement {
  return (
    <div data-page-header="" className={className}>
      {breadcrumbs && <div className="mb-2">{breadcrumbs}</div>}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <PageHeading>{title}</PageHeading>
          {subtitle && (
            <div className="mt-1">
              <Subtitle>{subtitle}</Subtitle>
            </div>
          )}
        </div>
        {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
      </div>
      {tabs && <div className="mt-4">{tabs}</div>}
    </div>
  );
}

/**
 * The top of a page: breadcrumbs, title, subtitle, actions and tabs. Its fixed bottom margin puts
 * every page's first block at the same y; as a direct child of a `Stack` it has none, so the Stack's
 * gap is the only space under it.
 */
export function PageHeader(props: PageHeaderProps): ReactElement {
  return <PageHeaderContent {...props} className="mb-8" />;
}
