import type { MouseEventHandler, ReactElement, ReactNode } from "react";
import { cx, focusRing } from "./cx.js";
import { useDensity } from "./density.js";
import { renderLink } from "./link.js";
import type { Passthrough } from "./props.js";
import {
  isEmptySlot,
  type LoadingProps,
  passthroughOf,
  useLoading,
  WaitingBone,
} from "./skeleton.js";
import { splitTip } from "./pillTip.js";
import { Tipped } from "./Tooltip.js";
import type { Size } from "./size.js";
import type { Tone } from "./tone.js";

/** A Pill's tones: the five meanings, and `accent` for a category that is none of them. */
export type PillTone = Tone | "accent";

type PillBase = LoadingProps & {
  /** The pill's text; while `loading`, none yet draws the pill as a bone of its size. */
  children?: ReactNode;
  /**
   * What the pill means: `neutral`, `info`, `positive`, `warn` or `danger`, or `accent` for a
   * category that is none of those.
   * @default neutral
   */
  tone?: PillTone;
  /**
   * `sm` is smaller text, for a dense row; `lg` larger, beside a heading. Left out, a Pill takes
   * the size of the `Card`, `ListRow` or `Table` it sits in, else `md`.
   * @default the container's, else md
   */
  size?: Size | undefined;
  /** A leading dot in the pill's own text colour. */
  dot?: boolean;
  /** A full pill shape in place of the rounded-md corners. */
  round?: boolean;
  /**
   * The detail behind a pill whose text is short or cut off (the full status, a date): its tooltip
   * on hover, keyboard focus and a tap, and its description. A plain pill with a title is focusable.
   */
  title?: string | undefined;
  /**
   * The name half of a two-tone `name: value` pill: `children` is the value. The name keeps the
   * tone's tint and the value sits on a plain surface beside it, in a hairline border. Keep the
   * name to a word or two (`Weight`, `Sleep`).
   */
  name?: string | undefined;
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
    | { href?: undefined; external?: undefined; onClick?: undefined }
    | {
        /** A Pill that is a button: runs `onClick`. Defaults to `type="button"`. */
        onClick: MouseEventHandler<HTMLButtonElement>;
        href?: undefined;
        external?: undefined;
      }
    | {
        onClick?: undefined;
        /** Opens in a new tab: adds `target="_blank"` and `rel="noreferrer"`. */
        external?: boolean | undefined;
        /** Makes the pill a link to this URL; an in-app path goes through the app's `LinkProvider`. */
        href: string;
      }
  );

const PILL_TONES: Record<PillTone, string> = {
  neutral: "bg-slate-100 text-slate-600",
  warn: "bg-amber-50 text-amber-700",
  positive: "bg-emerald-50 text-emerald-700",
  info: "bg-blue-50 text-blue-700",
  danger: "bg-red-50 text-red-900",
  accent: "bg-violet-50 text-violet-700",
};

/** The text size of each step: `md` is the pill as it has always been. */
const TEXT: Record<Size, string> = { sm: "text-[11px]", md: "text-xs", lg: "text-sm" };

/** A loading pill's height at each step: the pill's own line box. */
const BONE_HEIGHT: Record<Size, string> = { sm: "h-4", md: "h-5", lg: "h-6" };

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
  size: Size;
  round: boolean;
  dot: boolean;
  labelled: boolean;
  removable: boolean;
};

/** The two-tone pill is a hairline-bordered box: the label half carries the tint, the value half sits on the surface. */
const SPLIT = "inline-flex overflow-hidden border border-slate-200 font-medium";

/** The box a one-piece pill draws, or the whole pill when it is a single element. */
function pillClass({ tone, size, round, dot, labelled }: Look, interactive: boolean): string {
  return cx(
    round ? "rounded-full" : "rounded-md",
    TEXT[size],
    labelled ? SPLIT : cx("px-1.5 py-0.5 font-medium", PILL_TONES[tone]),
    dot && !labelled && "inline-flex items-center gap-1",
    interactive && INTERACTIVE,
  );
}

/** The shell round a pill with an x: it carries the tint and the corners, and the text and the x are its two children. */
function shellClass({ tone, size, round, labelled }: Look): string {
  return cx(
    round ? "rounded-full" : "rounded-md",
    "inline-flex items-center font-medium",
    TEXT[size],
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

/** The inside of a pill: the dot and the text, or for a two-tone one the tinted name beside the value. */
function PillBody({
  look: { tone, dot, removable },
  name,
  children,
}: {
  look: Look;
  name: string | undefined;
  children: ReactNode;
}): ReactElement {
  const mark = dot && <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-current" />;
  if (name === undefined) {
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
        {name}
        <span className="sr-only">:</span>
      </span>
      <span className={cx("bg-white py-px text-slate-900", removable ? "pl-1.5 pr-0.5" : "px-1.5")}>
        {children}
      </span>
    </>
  );
}

type MainParts = {
  interactive: boolean;
  look: Look;
  rest: object;
  /** The tooltip's wiring alone, for the text half of a removable plain pill. */
  tip: object;
  /** A plain pill with a title takes a tab stop, so it draws the focus ring. */
  focusable: boolean;
  href: string | undefined;
  external: boolean;
  onClick: MouseEventHandler<HTMLButtonElement> | undefined;
  body: ReactNode;
};

/** The pill itself, or the text half of a removable one: a link, a button or a span. */
function renderMain(parts: MainParts) {
  const { interactive, look, rest, tip, focusable, href, external, onClick, body } = parts;
  const className = cx(
    look.removable ? mainClass(look, interactive) : pillClass(look, interactive),
    focusable && focusRing,
  );
  // A removable pill's attributes go on its link or button. On a plain one the shell is the pill
  // and keeps them, and the text half takes only the tooltip, so the x's own events never open it.
  const own = look.removable && !interactive ? tip : rest;
  if (href !== undefined) {
    return renderLink({ ...own, href, external, className, children: body });
  }
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
      <Tipped text={removeLabel} describes={false} own={{}}>
        {(tip) => (
          <button
            type="button"
            aria-label={removeLabel}
            {...tip}
            onClick={onRemove}
            className={removeClass(look)}
          >
            {REMOVE_MARK}
          </button>
        )}
      </Tipped>
    </span>
  );
}

/**
 * A small tinted label whose `tone` says what it means; `dot` adds a leading dot in the pill's own
 * text colour, `round` swaps the rounded-md corners for a full pill shape, and `size` steps the
 * text (with none, it takes its container's). `name` makes it two-tone, `name: value`: the name
 * keeps the tone's tint and the children, the value, sit on the surface beside it. `href` makes it
 * a link (the app's router link through `LinkProvider` for an in-app path, else a plain `<a>`;
 * `external` opens a new tab) and `onClick` makes it
 * a button, each with a hover dim and the focus ring. `onRemove` adds an x button after the text
 * (named by `removeLabel`), a separate button beside a link or button pill rather than nested in
 * it. `title` is its tooltip and description; a plain pill with one takes a tab stop. While
 * `loading` with no text yet it is a bone of its size.
 */
export function Pill(props: PillProps): ReactElement {
  const size = useDensity(props.size);
  if (useLoading(props.loading).loading && isEmptySlot(props.children)) {
    const corners = props.round ? "rounded-full" : "rounded-md";
    return (
      <WaitingBone
        own={props.loading}
        label={props.loadingLabel}
        attrs={passthroughOf(props)}
        root="inline-flex align-middle"
        shape={cx("inline-block w-14", BONE_HEIGHT[size], corners)}
      />
    );
  }
  return <ShownPill {...props} size={size} />;
}

/** A pill with its text. */
function ShownPill({
  children,
  tone = "neutral",
  size,
  dot = false,
  round = false,
  name,
  href,
  external = false,
  onClick,
  onRemove,
  removeLabel,
  loading: _loading,
  loadingLabel: _loadingLabel,
  ...rest
}: PillProps & { size: Size }): ReactElement {
  const interactive = href !== undefined || onClick !== undefined;
  const look: Look = {
    tone,
    size,
    round,
    dot,
    labelled: name !== undefined,
    removable: onRemove !== undefined,
  };
  const body = (
    <PillBody look={look} name={name}>
      {children}
    </PillBody>
  );
  // The title is the pill's detail: a description, shown on hover, keyboard focus and (on a plain
  // pill, whose tap does nothing else) a tap. A plain titled pill takes a tab stop for it.
  const { title, ...own } = rest;
  // An empty title shows nothing, so it takes no tab stop either.
  const titled = title !== undefined && title !== "";
  const focusable = titled && !interactive;
  return (
    <Tipped text={title} describes tap={!interactive} own={{ ...own, title }}>
      {(tip) => {
        const attrs = { ...own, ...tip, ...(focusable ? { tabIndex: 0 } : {}) };
        const { wiring, rest: shell } = titled ? splitTip(attrs) : { wiring: {}, rest: attrs };
        const main = renderMain({
          interactive,
          look,
          rest: attrs,
          tip: wiring,
          focusable,
          href,
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
            attrs={shell}
            interactive={interactive}
          >
            {main}
          </RemoveShell>
        );
      }}
    </Tipped>
  );
}
