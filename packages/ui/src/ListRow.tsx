import type { ComponentPropsWithoutRef, ReactElement, ReactNode } from "react";
import type { ControlSize } from "./control.js";
import { Chevron } from "./Chevron.js";
import { cx, focusRing } from "./cx.js";
import { type LinkRender, renderLink } from "./link.js";
import type { Unstyled } from "./props.js";

const ROW = `flex w-full items-center gap-3 text-left text-sm text-slate-900 disabled:pointer-events-none disabled:opacity-50 ${focusRing} focus-visible:-outline-offset-2`;

const STATIC = "group/row flex w-full items-center gap-3 text-sm text-slate-900";

const FILL = "hover:bg-slate-50";
const SELECTED = "bg-violet-50 hover:bg-violet-50";

/** Hidden until the row is hovered or has focus inside it; always shown where any pointer is coarse (a touch screen, hybrids included). */
const REVEAL =
  "opacity-0 group-hover/row:opacity-100 group-focus-within/row:opacity-100 any-pointer-coarse:opacity-100";

const PAD: Record<ControlSize, string> = { md: "px-4 py-3", sm: "px-3 py-2" };

type Shared = {
  /** `sm` is dense padding. Defaults to `md`. */
  size?: ControlSize | undefined;
  /** A hairline above the row: set it on every row after the first. */
  divided?: boolean | undefined;
  /** Content before the label: an Avatar, a thumbnail, an icon. */
  leading?: ReactNode | undefined;
  /** Content at the far end of the row: a value, a count, a Pill. */
  trailing?: ReactNode | undefined;
  /**
   * Marks the row in view, the one whose detail is open: a violet fill and `aria-current="true"`.
   * Set it on one row of a list.
   */
  selected?: boolean | undefined;
  children: ReactNode;
};

type NotStatic = {
  static?: undefined;
  actions?: undefined;
  revealOnHover?: undefined;
};

type ListRowButtonProps = Shared &
  NotStatic & {
    /**
     * Makes the row a collapsible header: sets `aria-expanded` and shows a chevron that turns down
     * when open. The caller owns the state and the section; pass `aria-controls` to name it.
     */
    expanded?: boolean | undefined;
    href?: undefined;
    render?: undefined;
  } & Unstyled<Omit<ComponentPropsWithoutRef<"button">, "children">>;

type ListRowLinkProps = Shared &
  NotStatic & {
    /** Opens in a new tab: adds `target="_blank"` and `rel="noreferrer"`. */
    external?: boolean | undefined;
    expanded?: undefined;
  } & Unstyled<Omit<ComponentPropsWithoutRef<"a">, "href" | "children">> &
  (
    | { href: string; render?: LinkRender | undefined }
    | { href?: string | undefined; render: LinkRender }
  );

type ListRowStaticProps = Shared & {
  /**
   * A row that is neither a button nor a link, for one that holds its own controls: a `<div>` with
   * no click target and no hover fill (unless `revealOnHover`), taking `actions` as well.
   */
  static: true;
  /** Buttons for this row, after `trailing`: `Button size="sm"`, `IconButton`. */
  actions?: ReactNode | undefined;
  /**
   * Hides `actions` until the row is hovered or something in it has focus, so a long list is not a
   * wall of buttons. A touch screen has no hover, so they are always shown there.
   */
  revealOnHover?: boolean | undefined;
  expanded?: undefined;
  href?: undefined;
  render?: undefined;
} & Unstyled<Omit<ComponentPropsWithoutRef<"div">, "children">>;

export type ListRowProps = ListRowButtonProps | ListRowLinkProps | ListRowStaticProps;

type Pieces = { start: ReactNode; label: ReactNode; end: ReactNode };

function look(props: ListRowProps): string {
  const { size = "md", divided = false, selected = false } = props;
  const fill = props.static && !props.revealOnHover ? undefined : FILL;
  return cx(
    props.static ? STATIC : ROW,
    PAD[size],
    divided && "border-t border-slate-200/70",
    selected ? SELECTED : fill,
  );
}

function StaticRow(props: ListRowStaticProps & Pieces): ReactElement {
  const {
    leading: _l,
    trailing: _t,
    selected,
    size: _s,
    divided: _d,
    static: _st,
    actions,
    revealOnHover = false,
    expanded: _e,
    href: _h,
    render: _r,
    start,
    label,
    end,
    ...rest
  } = props;
  return (
    <div
      {...rest}
      {...(selected ? { "aria-current": "true" as const } : {})}
      className={look(props)}
    >
      {start}
      {label}
      {end}
      {actions != null && (
        <span className={cx("flex shrink-0 items-center gap-2", revealOnHover && REVEAL)}>
          {actions}
        </span>
      )}
    </div>
  );
}

function LinkRow(props: ListRowLinkProps & Pieces): ReactElement {
  const {
    leading: _l,
    trailing: _t,
    selected,
    expanded: _e,
    size: _s,
    divided: _d,
    static: _st,
    actions: _a,
    revealOnHover: _rh,
    start,
    label,
    end,
    ...rest
  } = props;
  return renderLink({
    ...rest,
    ...(selected ? { "aria-current": "true" as const } : {}),
    className: look(props),
    children: (
      <>
        {start}
        {label}
        {end}
      </>
    ),
  });
}

function ButtonRow(props: ListRowButtonProps & Pieces): ReactElement {
  const {
    leading: _l,
    trailing: _t,
    selected,
    expanded,
    size: _s,
    divided: _d,
    static: _st,
    actions: _a,
    revealOnHover: _rh,
    href: _h,
    render: _r,
    start,
    label,
    end,
    ...rest
  } = props;
  return (
    <button
      type="button"
      {...rest}
      {...(selected ? { "aria-current": "true" as const } : {})}
      {...(expanded === undefined ? {} : { "aria-expanded": expanded })}
      className={look(props)}
    >
      {expanded !== undefined && <Chevron open={expanded} />}
      {start}
      {label}
      {end}
    </button>
  );
}

/**
 * A full-width row that is a `<button>` (or, with `href` or `render`, a link) with a hover fill, a
 * left-aligned label and `trailing` content at the far end. With `expanded` it is the header of a
 * collapsible section: `aria-expanded` and a chevron. Rows sit in a `Card flush`; `divided` draws
 * the line between them, on each row after the first.
 *
 * `leading` is content before the label, and `selected` marks the row in view. `static` makes the
 * row a plain `<div>` for one that holds its own buttons (a button cannot sit inside a button or a
 * link): `actions` follow `trailing`, and `revealOnHover` shows them only on hover or focus.
 */
export function ListRow(props: ListRowProps): ReactElement {
  const { leading, trailing, children } = props;
  const pieces: Pieces = {
    start: leading != null && <span className="shrink-0">{leading}</span>,
    label: <span className="min-w-0 flex-1">{children}</span>,
    end: trailing != null && (
      <span className="shrink-0 tabular-nums text-slate-500">{trailing}</span>
    ),
  };
  if (props.static) return <StaticRow {...props} {...pieces} />;
  if (props.href !== undefined || props.render !== undefined) {
    return <LinkRow {...props} {...pieces} />;
  }
  return <ButtonRow {...props} {...pieces} />;
}
