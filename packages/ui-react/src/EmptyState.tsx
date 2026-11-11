import { type ReactElement, type ReactNode, useId } from "react";
import { cx } from "./cx.js";
import type { Passthrough } from "./props.js";
import { AppScale, SectionHeading } from "./typography.js";

/**
 * What a list or a page shows when there is nothing in it yet: a centred `title`, the `children`
 * as the explanation under it (a `Text as="p"`, then `Steps` for a "get started" list), and
 * `actions` (buttons, links) in a centred row at the bottom. A named `<section>`. For one muted
 * line inside a card, use `Text as="p" color="muted"`. `level` is the title's heading level (default 2): one below the
 * page's own heading, so the empty state inside a `SectionHeading` section is a 3.
 */
export function EmptyState({
  title,
  level = 2,
  padding = "default",
  children,
  actions,
  ...rest
}: {
  /** The heading, centred: what is missing ("No projects yet"). It names the section. */
  title: ReactNode;
  /** The title's heading level, 2 to 6. It does not change how the title looks. */
  level?: 2 | 3 | 4 | 5 | 6 | undefined;
  /**
   * `inset` pads all four sides, for an empty state in a `Card flush`, whose body has no padding
   * of its own. `default` pads above and below only.
   * @default default
   */
  padding?: "default" | "inset" | undefined;
  children?: ReactNode;
  /** Buttons or links in a centred row at the bottom. */
  actions?: ReactNode;
} & Passthrough): ReactElement {
  const titleId = useId();
  return (
    <AppScale>
      <section
        {...rest}
        aria-labelledby={titleId}
        className={cx(
          "mx-auto flex w-full max-w-xl flex-col items-center gap-4 text-center",
          padding === "inset" ? "p-8" : "py-8",
        )}
      >
        <SectionHeading as={`h${level}`} id={titleId}>
          {title}
        </SectionHeading>
        {children != null && (
          <div className="flex w-full flex-col items-center gap-5">{children}</div>
        )}
        {actions != null && <div className="flex flex-wrap justify-center gap-2">{actions}</div>}
      </section>
    </AppScale>
  );
}
