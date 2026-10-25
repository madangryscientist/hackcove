import type { ComponentPropsWithoutRef, ReactElement, ReactNode } from "react";
import type { ControlSize } from "./control.js";
import { cx, focusRing } from "./cx.js";
import { type LinkRender, renderLink } from "./link.js";
import type { Unstyled } from "./props.js";

const ROW = `flex w-full items-center gap-3 text-left text-sm text-slate-900 hover:bg-slate-50 disabled:pointer-events-none disabled:opacity-50 ${focusRing} focus-visible:-outline-offset-2`;

const PAD: Record<ControlSize, string> = { md: "px-4 py-3", sm: "px-3 py-2" };

type Shared = {
  /** `sm` is dense padding. Defaults to `md`. */
  size?: ControlSize | undefined;
  /** A hairline above the row: set it on every row after the first. */
  divided?: boolean | undefined;
  /** Content at the far end of the row: a value, a count, a Pill. */
  trailing?: ReactNode | undefined;
  children: ReactNode;
};

type ListRowButtonProps = Shared & {
  /**
   * Makes the row a collapsible header: sets `aria-expanded` and shows a chevron that turns down
   * when open. The caller owns the state and the section; pass `aria-controls` to name it.
   */
  expanded?: boolean | undefined;
  href?: undefined;
  render?: undefined;
} & Unstyled<Omit<ComponentPropsWithoutRef<"button">, "children">>;

type ListRowLinkProps = Shared & {
  /** Opens in a new tab: adds `target="_blank"` and `rel="noreferrer"`. */
  external?: boolean | undefined;
  expanded?: undefined;
} & Unstyled<Omit<ComponentPropsWithoutRef<"a">, "href" | "children">> &
  (
    | { href: string; render?: LinkRender | undefined }
    | { href?: string | undefined; render: LinkRender }
  );

export type ListRowProps = ListRowButtonProps | ListRowLinkProps;

function Chevron({ open }: { open: boolean }): ReactElement {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      fill="currentColor"
      className={cx("h-4 w-4 shrink-0 text-slate-400", open && "rotate-90")}
    >
      <path
        fillRule="evenodd"
        d="M7.2 4.8a.75.75 0 0 1 1.06 0l4.7 4.67a.75.75 0 0 1 0 1.06l-4.7 4.67a.75.75 0 1 1-1.06-1.06L11.37 10 7.2 5.86a.75.75 0 0 1 0-1.06Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

/**
 * A full-width row that is a `<button>` (or, with `href` or `render`, a link) with a hover fill, a
 * left-aligned label and `trailing` content at the far end. With `expanded` it is the header of a
 * collapsible section: `aria-expanded` and a chevron. Rows sit in a `Card flush`; `divided` draws
 * the line between them, on each row after the first.
 */
export function ListRow(props: ListRowProps): ReactElement {
  const { trailing, children, size = "md", divided = false } = props;
  const look = cx(ROW, PAD[size], divided && "border-t border-slate-200/70");
  const label = <span className="min-w-0 flex-1">{children}</span>;
  const end = trailing != null && (
    <span className="shrink-0 tabular-nums text-slate-500">{trailing}</span>
  );
  if (props.href !== undefined || props.render !== undefined) {
    const {
      trailing: _t,
      expanded: _e,
      size: _s,
      divided: _d,
      href,
      render,
      external,
      ...rest
    } = props;
    return renderLink({
      ...rest,
      href,
      render,
      external,
      className: look,
      children: (
        <>
          {label}
          {end}
        </>
      ),
    });
  }
  const { trailing: _t, expanded, size: _s, divided: _d, href: _h, render: _r, ...rest } = props;
  return (
    <button
      type="button"
      {...rest}
      {...(expanded === undefined ? {} : { "aria-expanded": expanded })}
      className={look}
    >
      {expanded !== undefined && <Chevron open={expanded} />}
      {label}
      {end}
    </button>
  );
}
