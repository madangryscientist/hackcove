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
  /**
   * The name half of a two-tone `label: value` pill: `children` is the value. The label keeps the
   * tone's tint and the value sits on a plain surface beside it, in a hairline border. Keep the
   * label to a word or two (`Weight`, `Sleep`).
   */
  label?: string | undefined;
};

type Removable =
  | { onRemove?: undefined; removeLabel?: undefined }
  | {
      /** Adds a small x button after the text that calls this: for a chip the reader can drop (an attachment, a filter). It sits beside a link or button pill, never inside it. */
      onRemove: () => void;
      /** The x button's accessible name and tooltip: `Remove invoice.pdf`. Required with `onRemove`. */
      removeLabel: string;
    };

type PillProps = PillBase &
  Removable &
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

const INTERACTIVE = cx("transition hover:opacity-80", focusRing);

/** The x on a removable pill: two strokes in the pill's text colour. */
const REMOVE_MARK = (
  <svg
    aria-hidden="true"
    viewBox="0 0 12 12"
    className="size-3"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
  >
    <path d="M3 3l6 6M9 3l-6 6" />
  </svg>
);

type Look = {
  tone: PillTone;
  round: boolean;
  dot: boolean;
  labelled: boolean;
  removable: boolean;
};

/** The two-tone pill is a hairline-bordered box: the label half carries the tint, the value half sits on the surface. */
const SPLIT = "inline-flex overflow-hidden border border-slate-200 text-xs font-medium";

/** The box a one-piece pill draws, or the whole pill when it is a single element. */
function pillClass({ tone, round, dot, labelled }: Look, interactive: boolean): string {
  return cx(
    round ? "rounded-full" : "rounded-md",
    labelled ? SPLIT : cx("px-1.5 py-0.5 text-xs font-medium", PILL_TONES[tone]),
    dot && !labelled && "inline-flex items-center gap-1",
    interactive && INTERACTIVE,
  );
}

/** The shell round a pill with an x: it carries the tint and the corners, and the text and the x are its two children. */
function shellClass({ tone, round, labelled }: Look): string {
  return cx(
    round ? "rounded-full" : "rounded-md",
    "inline-flex items-center text-xs font-medium",
    labelled ? "overflow-hidden border border-slate-200" : PILL_TONES[tone],
  );
}

/** The text half of a removable pill, which is a link, a button or a span beside the x. */
function mainClass({ dot, labelled }: Look, interactive: boolean): string {
  return cx(
    labelled ? "inline-flex self-stretch" : "py-0.5 pl-1.5 pr-1",
    dot && !labelled && "inline-flex items-center gap-1",
    interactive && INTERACTIVE,
  );
}

function removeClass({ labelled }: Look): string {
  return cx(
    "inline-flex cursor-pointer items-center",
    labelled ? "self-stretch bg-white pl-0.5 pr-1.5 text-slate-900" : "py-0.5 pl-0.5 pr-1.5",
    INTERACTIVE,
  );
}

/** The inside of a pill: the dot and the text, or for a two-tone one the tinted label beside the value. */
function PillBody({
  look: { tone, dot, removable },
  label,
  children,
}: {
  look: Look;
  label: string | undefined;
  children: ReactNode;
}): ReactElement {
  const mark = dot && <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-current" />;
  if (label === undefined) {
    return (
      <>
        {mark}
        {children}
      </>
    );
  }
  return (
    <>
      <span
        className={cx("px-1.5 py-px", PILL_TONES[tone], dot && "inline-flex items-center gap-1")}
      >
        {mark}
        {label}
        <span className="sr-only">:</span>
      </span>
      <span className={cx("bg-white py-px text-slate-900", removable ? "pl-1.5 pr-0.5" : "px-1.5")}>
        {children}
      </span>
    </>
  );
}

type MainParts = {
  isLink: boolean;
  interactive: boolean;
  look: Look;
  rest: object;
  href: string | undefined;
  render: LinkRender | undefined;
  external: boolean;
  onClick: MouseEventHandler<HTMLButtonElement> | undefined;
  body: ReactNode;
};

/** The pill itself, or the text half of a removable one: a link, a button or a span. */
function renderMain({
  isLink,
  interactive,
  look,
  rest,
  href,
  render,
  external,
  onClick,
  body,
}: MainParts) {
  const className = look.removable ? mainClass(look, interactive) : pillClass(look, interactive);
  // A removable pill's attributes go on its link or button; on a plain one, the shell is the pill.
  const own = look.removable && !interactive ? {} : rest;
  if (isLink) return renderLink({ ...own, href, render, external, className, children: body });
  if (onClick) {
    return (
      <button type="button" {...own} onClick={onClick} className={cx(className, "cursor-pointer")}>
        {body}
      </button>
    );
  }
  return (
    <span {...own} className={className}>
      {body}
    </span>
  );
}

/** The shell round a removable pill: the text half and the x button beside it. */
function RemoveShell({
  look,
  remove: { onRemove, removeLabel },
  attrs,
  interactive,
  children,
}: {
  look: Look;
  remove: { onRemove: () => void; removeLabel: string | undefined };
  attrs: object;
  interactive: boolean;
  children: ReactNode;
}): ReactElement {
  return (
    <span {...(interactive ? {} : attrs)} className={shellClass(look)}>
      {children}
      <button
        type="button"
        aria-label={removeLabel}
        title={removeLabel}
        onClick={onRemove}
        className={removeClass(look)}
      >
        {REMOVE_MARK}
      </button>
    </span>
  );
}

/**
 * A small tinted label; `dot` adds a leading dot in the pill's own text colour, `round` swaps the
 * rounded-md corners for a full pill shape. `label` makes it two-tone, `label: value`: the label
 * keeps the tone's tint and the children, the value, sit on the surface beside it. `href` makes it
 * a link (a plain `<a>`, or with `render` the app's own router `<Link>`:
 * `render={(p) => <Link to="/flakes" {...p} />}`; `external` opens a new tab) and `onClick` makes it
 * a button, each with a hover dim and the focus ring. `onRemove` adds an x button after the text
 * (named by `removeLabel`), a separate button beside a link or button pill rather than nested in
 * it. `title` is the native tooltip.
 */
export function Pill({
  children,
  tone = "slate",
  dot = false,
  round = false,
  label,
  href,
  render,
  external = false,
  onClick,
  onRemove,
  removeLabel,
  ...rest
}: PillProps): ReactElement {
  const isLink = href !== undefined || render !== undefined;
  const interactive = isLink || onClick !== undefined;
  const look: Look = {
    tone,
    round,
    dot,
    labelled: label !== undefined,
    removable: onRemove !== undefined,
  };
  const body = (
    <PillBody look={look} label={label}>
      {children}
    </PillBody>
  );
  const main = renderMain({
    isLink,
    interactive,
    look,
    rest,
    href,
    render,
    external,
    onClick,
    body,
  });
  return onRemove === undefined ? (
    main
  ) : (
    <RemoveShell
      look={look}
      remove={{ onRemove, removeLabel }}
      attrs={rest}
      interactive={interactive}
    >
      {main}
    </RemoveShell>
  );
}
