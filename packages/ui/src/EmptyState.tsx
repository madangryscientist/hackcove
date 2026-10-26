import { type ReactElement, type ReactNode, useId } from "react";
import type { Passthrough } from "./props.js";
import { SectionHeading } from "./typography.js";

/**
 * What a list or a page shows when there is nothing in it yet: a centred `title`, the `children`
 * as the explanation under it (a `Body as="p"`, then `Steps` for a "get started" list), and
 * `actions` (buttons, links) in a centred row at the bottom. A named `<section>`. For one muted
 * line inside a card, use `Empty`.
 */
export function EmptyState({
  title,
  children,
  actions,
  ...rest
}: {
  title: ReactNode;
  children?: ReactNode;
  actions?: ReactNode;
} & Passthrough): ReactElement {
  const titleId = useId();
  return (
    <section
      {...rest}
      aria-labelledby={titleId}
      className="mx-auto flex w-full max-w-xl flex-col items-center gap-4 py-8 text-center"
    >
      <SectionHeading id={titleId}>{title}</SectionHeading>
      {children != null && (
        <div className="flex w-full flex-col items-center gap-5">{children}</div>
      )}
      {actions != null && <div className="flex flex-wrap justify-center gap-2">{actions}</div>}
    </section>
  );
}
