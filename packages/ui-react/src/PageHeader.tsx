import type { ReactElement, ReactNode } from "react";
import type { Passthrough } from "./props.js";
import { useWait } from "./layoutWait.js";
import { type LoadingProps, LoadingScope } from "./skeleton.js";
import { Lead, PageHeading } from "./typography.js";

export type PageHeaderProps = LoadingProps & {
  /** A `Breadcrumbs` above the title. */
  breadcrumbs?: ReactNode;
  /** The page's `h1`. */
  title: ReactNode;
  /** The lede under the title: a `Lead`, so it outranks the body text after it. */
  description?: ReactNode;
  /** Right of the title on `sm` and up, below it on a phone. */
  actions?: ReactNode;
  /** A `Tabs` (or similar) under the title. */
  tabs?: ReactNode;
};

/** The header block without its bottom margin; PageHeader adds the margin (a `Stack` child drops it). */
export function PageHeaderContent({
  breadcrumbs,
  title,
  description,
  actions,
  tabs,
  className,
  loading,
  loadingLabel,
  ...rest
}: PageHeaderProps & Passthrough & { className?: string }): ReactElement {
  const wait = useWait(loading, loadingLabel);
  return (
    <LoadingScope loading={wait.loading}>
      <div {...rest} {...wait.attrs} data-page-header="" className={className}>
        {breadcrumbs && <div className="mb-2">{breadcrumbs}</div>}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <PageHeading>{title}</PageHeading>
            {description && (
              <div className="mt-2 max-w-[60ch]">
                <Lead>{description}</Lead>
              </div>
            )}
          </div>
          {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
        </div>
        {tabs && <div className="mt-4">{tabs}</div>}
        {wait.label}
      </div>
    </LoadingScope>
  );
}

/**
 * The top of a page: breadcrumbs, title, description, actions and tabs. Its fixed bottom margin puts
 * every page's first block at the same y; as a direct child of a `Stack` it has none, so the Stack's
 * gap is the only space under it.
 * While `loading` it is the owner of the wait: what it has is drawn and an empty title is a bone.
 */
export function PageHeader(props: PageHeaderProps & Passthrough): ReactElement {
  return <PageHeaderContent {...props} className="mb-8" />;
}
