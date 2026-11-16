import { type ReactElement, type ReactNode, useId } from "react";
import { cx } from "./cx.js";
import { type HeadingLevel, HeadingLevelProvider, useHeadingLevel } from "./headingLevel.js";
import type { Passthrough } from "./props.js";
import type { Size } from "./size.js";
import { Stack, type StackGap, type StackWidth } from "./Stack.js";
import { CardOverline, SectionHeading } from "./typography.js";

/** A `Section`'s scale: `sm` a small titled group, `md` a page's section. */
export type SectionSize = Extract<Size, "sm" | "md">;

/** The id a `Section`'s heading takes: the caller's, or one of React's. */
function useHeadingId(id: string | undefined): string {
  const generated = useId();
  return id ?? generated;
}

/**
 * A `<section>` Stack with an optional `SectionHeading` title (which names it) and `actions` beside
 * it. Its blocks are `gap` apart, from where it sits as in a `Stack`. `rule` draws a hairline under the
 * title row, `actions` included, as `SectionHeading`'s `rule` does for a bare heading. A line
 * between two sections is a `Divider` in the `Stack` that holds them. `level` is the title's
 * heading level, one below the heading that holds the section (an `h2` on the page), and a heading
 * inside it (a `Card`'s title) is one below that.
 *
 * `size="sm"` is the small titled group inside a page, a card, a drawer or a side panel (a panel's
 * "Flaky" block, a card's "Ignore areas"): the title is drawn small and all-caps like a `Card`'s
 * title, the blocks are `xs` apart, and it is still a region named by its title. Never build one
 * from a `Stack as="section"` and an `Overline`.
 */
export function Section({
  id,
  title,
  actions,
  rule = false,
  level,
  size = "md",
  gap,
  width = "default",
  children,
  ...rest
}: {
  /**
   * Makes the section a link target: `#<id>` scrolls to its heading, which stops below the sticky
   * AppShell header. Needs a `title`: with no title the heading that carries it is not rendered.
   */
  id?: string | undefined;
  /** A `SectionHeading` at the top, which names the section. */
  title?: ReactNode;
  /** Buttons or links at the end of the title row. */
  actions?: ReactNode;
  /**
   * A hairline under the title row across the section's width, `actions` included. Needs a `title`
   * or `actions`.
   * @default false
   */
  rule?: boolean | undefined;
  /**
   * The title's heading level, 2 to 6. It does not change how the title looks.
   * @default one below the heading that holds the section: 2 on the page
   */
  level?: HeadingLevel | undefined;
  /**
   * `md` is a page's titled section; `sm` is a small titled group inside a page, a card or a panel,
   * its title small and all-caps, its blocks `xs` apart.
   * @default md
   */
  size?: SectionSize | undefined;
  /**
   * The space between blocks: `xs` gap-2, `sm` gap-4, `md` gap-6, `lg` gap-8, `xl` gap-12 (gap-16 from `sm`).
   * @default xs at `size="sm"`; else xs inside a `Card`, `Dialog`, `Drawer`, `BottomSheet`, `Callout` or `ListRow`, else md
   */
  gap?: StackGap | undefined;
  /**
   * Caps the column: `compact` max-w-md (one card or one picture's column), `narrow` max-w-3xl (a
   * reading measure), `wide` max-w-5xl, `full` the parent's whole width, `default` sets nothing.
   * @default default
   */
  width?: StackWidth | undefined;
  children?: ReactNode;
} & Passthrough): ReactElement {
  const titleId = useHeadingId(id);
  const own = useHeadingLevel(level);
  return (
    <Stack
      as="section"
      {...rest}
      gap={gap ?? (size === "sm" ? "xs" : undefined)}
      width={width}
      aria-labelledby={title ? titleId : rest["aria-labelledby"]}
    >
      <TitleRow size={size} title={title} id={titleId} level={own} actions={actions} rule={rule} />
      {title ? <HeadingLevelProvider level={own}>{children}</HeadingLevelProvider> : children}
    </Stack>
  );
}

/** A section's title row: its heading at `size`, then `actions` at the end. Nothing without either. */
function TitleRow({
  size,
  title,
  id,
  level,
  actions,
  rule,
}: {
  size: SectionSize;
  title: ReactNode;
  id: string;
  level: HeadingLevel;
  actions: ReactNode;
  rule: boolean;
}): ReactElement | null {
  if (!title && !actions) return null;
  return (
    <div
      className={cx(
        "flex items-center justify-between",
        size === "sm" ? "gap-2" : "gap-4",
        rule && "border-b border-slate-200/70 pb-2",
      )}
    >
      {title &&
        (size === "sm" ? (
          <CardOverline id={id} level={level} faint={false}>
            {title}
          </CardOverline>
        ) : (
          <SectionHeading as={`h${level}`} id={id}>
            {title}
          </SectionHeading>
        ))}
      {actions && <div className="ml-auto flex items-center gap-2">{actions}</div>}
    </div>
  );
}
