import { type ReactElement, type ReactNode, useId } from "react";
import { Cluster } from "./Cluster.js";
import { cx } from "./cx.js";
import { type HeadingLevel, HeadingLevelProvider, useHeadingLevel } from "./headingLevel.js";
import type { Passthrough } from "./props.js";
import type { Size } from "./size.js";
import { Stack, type StackGap, type StackWidth } from "./Stack.js";
import { CardOverline, Display, Lead, Overline, SectionHeading } from "./typography.js";

/** A `Section`'s scale: `sm` a small titled group, `md` a page's section, `lg` a landing page's section. */
export type SectionSize = Size;

/** The id a `Section`'s heading takes: the caller's, or one of React's. */
function useHeadingId(id: string | undefined): string {
  const generated = useId();
  return id ?? generated;
}

type SectionBase = {
  /**
   * Makes the section a link target: `#<id>` scrolls to its heading, which stops below the sticky
   * AppShell header, as every `id` inside the shell does; write no `scroll-margin`. Needs a `title`:
   * with no title the heading that carries it is not rendered.
   */
  id?: string | undefined;
  /** The heading at the top, which names the section. */
  title?: ReactNode;
  /** Buttons or links: at the end of the title row, or under the description at `size="lg"`. */
  actions?: ReactNode;
  /**
   * The title's heading level, 2 to 6. It does not change how the title looks.
   * @default one below the heading that holds the section: 2 on the page
   */
  level?: HeadingLevel | undefined;
  /**
   * The space between blocks: `xs` gap-2, `sm` gap-4, `md` gap-6, `lg` gap-8, `xl` gap-12 (gap-16 from `sm`).
   * @default xs at `size="sm"`, lg at `size="lg"`; else xs inside a `Card`, `Dialog`, `Drawer`, `BottomSheet`, `Callout` or `ListRow`, else md
   */
  gap?: StackGap | undefined;
  /**
   * Caps the column: `compact` max-w-md (one card or one picture's column), `narrow` max-w-3xl (a
   * reading measure), `wide` max-w-5xl, `full` the parent's whole width, `default` sets nothing.
   * @default default
   */
  width?: StackWidth | undefined;
  children?: ReactNode;
} & Passthrough;

/** The opening a page or landing section takes over its title: a kicker and a line under it. */
type Opening = {
  /** A small label above the title, in the same `<header>` (mono at `size="lg"`). Needs a `title`. */
  overline?: ReactNode;
  /** The line under the title, outside the heading: a muted line at `md`, a `Lead` at `lg`. */
  description?: ReactNode;
};

type SectionProps = SectionBase &
  (
    | ({
        /**
         * `sm` a small titled group inside a page, a card or a panel, its title small and all-caps
         * and its blocks `xs` apart; `md` a page's section; `lg` a landing page's section, a display
         * title under a mono kicker, a `Lead`, then its calls to action.
         *
         * A landing page's section under the `Hero` is `size="lg"`: its opening is capped at the
         * reading measure at the start edge and its blocks sit `lg` apart. A feature card in it is
         * a `Card href icon titleStyle="name"` in a `CardGrid`; text beside code is a `SideColumn`.
         * @default md
         */
        size?: "md" | undefined;
        /**
         * A hairline under the title row across the section's width, `actions` included. Needs a
         * `title` or `actions`.
         * @default false
         */
        rule?: boolean | undefined;
      } & Opening)
    | {
        size: "sm";
        /**
         * A hairline under the title row across the section's width, `actions` included. Needs a
         * `title` or `actions`.
         */
        rule?: boolean | undefined;
        overline?: never;
        description?: never;
      }
    | ({
        size: "lg";
        rule?: never;
      } & Opening)
  );

/**
 * A `<section>` Stack with an optional title (which names it) and `actions`. Its blocks are `gap`
 * apart, from where it sits as in a `Stack`. `level` is the title's heading level, one below the
 * heading that holds the section (an `h2` on the page), and a heading inside it (a `Card`'s title)
 * is one below that. A line between two sections is a `Divider` in the `Stack` that holds them.
 *
 * `size` picks the scale:
 * - `md` (default): a page's section. A `SectionHeading` title with `actions` at the end of its row;
 *   `rule` draws a hairline under the row, `overline` a small label above the title and
 *   `description` a muted line under it.
 * - `sm`: the small titled group inside a page, a card, a drawer or a side panel (a panel's "Flaky"
 *   block, a card's "Ignore areas"): the title small and all-caps like a `Card`'s, the blocks `xs`
 *   apart. Never build one from a `Stack as="section"` and an `Overline`.
 * - `lg`: a landing page's section under the `Hero`: a mono `overline` kicker, the title at display
 *   size, `description` as a `Lead` and `actions` under it as its calls to action, the opening
 *   capped at the reading measure at the start edge, the blocks `lg` apart. It ignores the prose scale.
 */
export function Section({
  id,
  title,
  actions,
  rule = false,
  overline,
  description,
  level,
  size = "md",
  gap,
  width = "default",
  children,
  ...rest
}: SectionProps): ReactElement {
  const titleId = useHeadingId(id);
  const own = useHeadingLevel(level);
  const head = { title, actions, id: titleId, level: own };
  return (
    <Stack
      as="section"
      {...rest}
      gap={gap ?? DEFAULT_GAP[size]}
      width={width}
      aria-labelledby={title ? titleId : rest["aria-labelledby"]}
    >
      {size === "lg" ? (
        <LandingOpening {...head} overline={overline} description={description} />
      ) : (
        <TitleRow
          {...head}
          small={size === "sm"}
          rule={rule}
          overline={overline}
          description={description}
        />
      )}
      {title ? <HeadingLevelProvider level={own}>{children}</HeadingLevelProvider> : children}
    </Stack>
  );
}

const DEFAULT_GAP: Record<SectionSize, StackGap | undefined> = {
  sm: "xs",
  md: undefined,
  lg: "lg",
};

type Head = { title: ReactNode; actions: ReactNode; id: string; level: HeadingLevel };

const present = (node: ReactNode) => node != null && node !== false;

/** A `sm` or `md` section's title row: its heading, then `actions` at the end. Nothing without either. */
function TitleRow({
  title,
  actions,
  id,
  level,
  small,
  rule,
  overline,
  description,
}: Head & {
  small: boolean;
  rule: boolean;
  overline: ReactNode;
  description: ReactNode;
}): ReactElement | null {
  if (!title && !actions) return null;
  const heading = small ? (
    <CardOverline id={id} level={level} faint={false}>
      {title}
    </CardOverline>
  ) : (
    <SectionHeading as={`h${level}`} id={id} description={description}>
      {title}
    </SectionHeading>
  );
  return (
    <div
      className={cx(
        "flex items-center justify-between",
        small ? "gap-2" : "gap-4",
        rule && "border-b border-slate-200/70 pb-2",
      )}
    >
      {title &&
        (present(overline) ? (
          <header className="flex flex-col gap-1">
            <Overline>{overline}</Overline>
            {heading}
          </header>
        ) : (
          heading
        ))}
      {actions && <div className="ml-auto flex items-center gap-2">{actions}</div>}
    </div>
  );
}

/** A `lg` section's opening: the kicker and the display title in one `<header>`, the lede, the calls to action. */
function LandingOpening({
  title,
  actions,
  id,
  level,
  overline,
  description,
}: Head & { overline: ReactNode; description: ReactNode }): ReactElement | null {
  if (!title && !actions) return null;
  return (
    <div className="flex max-w-3xl flex-col gap-4">
      {title && (
        <header>
          {present(overline) && <Overline mono>{overline}</Overline>}
          <Display as={`h${level}`} id={id}>
            {title}
          </Display>
        </header>
      )}
      {title && present(description) && <Lead>{description}</Lead>}
      {actions && <Cluster>{actions}</Cluster>}
    </div>
  );
}
