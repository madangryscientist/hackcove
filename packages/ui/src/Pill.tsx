import type { MouseEventHandler, ReactElement, ReactNode } from "react";
import { cx, focusRing } from "./cx.js";
import { type LinkRender, renderLink } from "./link.js";
import type { Passthrough } from "./props.js";

export type PillTone = "slate" | "amber" | "emerald" | "blue" | "red" | "violet" | "sky";

type PillBase = {
  children: ReactNode;
  /**
   * The tint: `slate`, `amber`, `emerald`, `blue`, `red`, `violet` or `sky`.
   * @default slate
   */
  tone?: PillTone;
  /** A leading dot in the pill's own text colour. */
  dot?: boolean;
  /** A full pill shape in place of the rounded-md corners. */
  round?: boolean;
  /** The tooltip on hover, for a pill whose text is short or cut off: the full status, a date. */
  title?: string | undefined;
};

type PillProps = PillBase &
  Passthrough &
  (
    | { href?: undefined; render?: undefined; external?: undefined; onClick?: undefined }
    | {
        /** A Pill that is a button: runs `onClick`. Defaults to `type="button"`. */
        onClick: MouseEventHandler<HTMLButtonElement>;
        href?: undefined;
        render?: undefined;
        external?: undefined;
      }
    | ({
        onClick?: undefined;
        /** Opens in a new tab: adds `target="_blank"` and `rel="noreferrer"`. */
        external?: boolean | undefined;
      } & (
        | {
            /** Makes the pill a link to this URL. */
            href: string;
            /** Draws the link with the app's own router `<Link>`: `(p) => <Link to="/flakes" {...p} />`. */
            render?: LinkRender | undefined;
          }
        | {
            /** Makes the pill a link to this URL. */
            href?: string | undefined;
            /** Draws the link with the app's own router `<Link>`: `(p) => <Link to="/flakes" {...p} />`. */
            render: LinkRender;
          }
      ))
  );

const PILL_TONES: Record<PillTone, string> = {
  slate: "bg-slate-100 text-slate-600",
  amber: "bg-amber-50 text-amber-700",
  emerald: "bg-emerald-50 text-emerald-700",
  blue: "bg-blue-50 text-blue-700",
  red: "bg-red-50 text-red-900",
  violet: "bg-violet-50 text-violet-700",
  sky: "bg-sky-50 text-sky-700",
};

function pillClass(
  { tone, round, dot }: Required<Pick<PillBase, "tone" | "round" | "dot">>,
  interactive: boolean,
): string {
  return cx(
    round ? "rounded-full" : "rounded-md",
    "px-1.5 py-0.5 text-xs font-medium",
    PILL_TONES[tone],
    dot && "inline-flex items-center gap-1",
    interactive && cx("transition hover:opacity-80", focusRing),
  );
}

/**
 * A small tinted label; `dot` adds a leading dot in the pill's own text colour, `round` swaps the
 * rounded-md corners for a full pill shape. `href` makes it a link (a plain `<a>`, or with `render`
 * the app's own router `<Link>`: `render={(p) => <Link to="/flakes" {...p} />}`; `external` opens a
 * new tab) and `onClick` makes it a button, each with a hover dim and the focus ring. `title` is
 * the native tooltip.
 */
export function Pill({
  children,
  tone = "slate",
  dot = false,
  round = false,
  href,
  render,
  external = false,
  onClick,
  ...rest
}: PillProps): ReactElement {
  const isLink = href !== undefined || render !== undefined;
  const className = pillClass({ tone, round, dot }, isLink || onClick !== undefined);
  const content = (
    <>
      {dot && <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-current" />}
      {children}
    </>
  );
  if (isLink) {
    return renderLink({ ...rest, href, render, external, className, children: content });
  }
  if (onClick) {
    return (
      <button type="button" {...rest} onClick={onClick} className={cx(className, "cursor-pointer")}>
        {content}
      </button>
    );
  }
  return (
    <span {...rest} className={className}>
      {content}
    </span>
  );
}
