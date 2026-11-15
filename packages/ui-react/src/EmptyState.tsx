import { type ReactElement, type ReactNode, useId } from "react";
import { useInCard } from "./cardContext.js";
import { cx } from "./cx.js";
import { type HeadingLevel, useHeadingLevel } from "./headingLevel.js";
import { Icon } from "./Icon.js";
import type { IconName } from "./icons.js";
import type { Passthrough } from "./props.js";
import { AppScale, SectionHeading } from "./typography.js";

/**
 * What a list or a page shows when there is nothing in it yet: a centred `title`, the `children`
 * as the explanation under it (a `Text`, then `Steps` for a "get started" list), and
 * `actions` (buttons, links) in a centred row at the bottom, with an optional `icon` above the
 * title. A named `<section>`. On its own it draws a dashed frame round itself; inside a `Card` the
 * card is the frame. For one muted line inside a card, use `Text tone="muted"`. `level` is the
 * title's heading level, one below the heading that holds it: a 2 on the page, a 3 in a `Section`.
 */
export function EmptyState({
  title,
  icon,
  level,
  padding = "default",
  children,
  actions,
  ...rest
}: {
  /** The heading, centred: what is missing ("No projects yet"). It names the section. */
  title: ReactNode;
  /** One of the library's icons, at feature size in the muted ink above the title. */
  icon?: IconName | undefined;
  /**
   * The title's heading level, 2 to 6. It does not change how the title looks.
   * @default one below the heading that holds it: 2 on the page
   */
  level?: HeadingLevel | undefined;
  /**
   * `inset` pads all four sides, for an empty state in a `Card flush`, whose body has no padding
   * of its own. `default` pads above and below only. On its own, outside a card, it pads all four
   * sides inside its frame either way.
   * @default default
   */
  padding?: "default" | "inset" | undefined;
  children?: ReactNode;
  /** Buttons or links in a centred row at the bottom. */
  actions?: ReactNode;
} & Passthrough): ReactElement {
  const titleId = useId();
  const own = useHeadingLevel(level);
  const framed = !useInCard();
  return (
    <AppScale>
      <section
        {...rest}
        aria-labelledby={titleId}
        className={cx(
          "flex w-full flex-col items-center gap-4 text-center",
          framed
            ? "rounded-xl border border-dashed border-slate-300 p-8"
            : cx("mx-auto max-w-xl", padding === "inset" ? "p-8" : "py-8"),
        )}
      >
        {icon && (
          <span className="flex text-slate-400">
            <Icon name={icon} size="feature" />
          </span>
        )}
        <SectionHeading as={`h${own}`} id={titleId}>
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
