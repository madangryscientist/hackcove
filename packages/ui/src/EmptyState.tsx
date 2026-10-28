import { type ReactElement, type ReactNode, useId } from "react";
import type { Passthrough } from "./props.js";
import { SectionHeading } from "./typography.js";

/**
 * What a list or a page shows when there is nothing in it yet: a centred `title`, the `children`
 * as the explanation under it (a `Body as="p"`, then `Steps` for a "get started" list), and
 * `actions` (buttons, links) in a centred row at the bottom. A named `<section>`. For one muted
 * line inside a card, use `Empty`. `level` is the title's heading level (default 2): one below the
 * page's own heading, so the empty state inside a `SectionHeading` section is a 3.
 */
export function EmptyState({
  title,
  level = 2,
  children,
  actions,
  ...rest
}: {
  /** The heading, centred: what is missing ("No projects yet"). It names the section. */
  title: ReactNode;
  /** The title's heading level, 2 to 6. It does not change how the title looks. */
  level?: 2 | 3 | 4 | 5 | 6 | undefined;
  children?: ReactNode;
  /** Buttons or links in a centred row at the bottom. */
  actions?: ReactNode;
} & Passthrough): ReactElement {
  const titleId = useId();
  return (
    <section
      {...rest}
      aria-labelledby={titleId}
      className="mx-auto flex w-full max-w-xl flex-col items-center gap-4 py-8 text-center"
    >
      <SectionHeading as={`h${level}`} id={titleId}>
        {title}
      </SectionHeading>
      {children != null && (
        <div className="flex w-full flex-col items-center gap-5">{children}</div>
      )}
      {actions != null && <div className="flex flex-wrap justify-center gap-2">{actions}</div>}
    </section>
  );
}
