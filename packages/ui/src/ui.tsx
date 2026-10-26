import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { type CalloutTone, TONE_SURFACE } from "./Callout.js";
import type { ControlSize } from "./control.js";
import { cx } from "./cx.js";
import { PageHeaderContent } from "./PageHeader.js";
import type { Passthrough } from "./props.js";

// Small presentational primitives written against Tailwind's slate-based class vocabulary
// (remapped to Catppuccin Mocha in dark mode by theme.css).

/** @deprecated use PageHeader */
export function PageTitle({
  title,
  subtitle,
  ...rest
}: { title: string; subtitle?: string } & Passthrough) {
  return <PageHeaderContent {...rest} title={title} subtitle={subtitle} />;
}

function CardHeading({
  title,
  count,
  status,
  bar,
  spaced,
  size,
}: {
  title: string;
  count: number | undefined;
  status: ReactNode;
  bar: boolean;
  spaced: boolean;
  size: ControlSize;
}) {
  const ink = bar ? "text-slate-500" : "text-slate-400";
  return (
    <div
      className={cx(
        "flex gap-2",
        status ? "items-center" : "items-baseline",
        spaced && (size === "sm" ? "mb-2" : "mb-3"),
      )}
    >
      <h2 className={cx("text-xs font-semibold uppercase tracking-wide", ink)}>{title}</h2>
      {count !== undefined && <span className={cx("text-xs font-medium", ink)}>{count}</span>}
      {status}
    </div>
  );
}

function CardActions({ children }: { children: ReactNode }) {
  return <div className="ml-auto flex items-center gap-2">{children}</div>;
}

function CardBar({
  heading,
  actions,
  size,
}: {
  heading: ReactNode;
  actions: ReactNode;
  size: ControlSize;
}) {
  return (
    <div
      className={cx(
        "flex items-center justify-between gap-3 border-b border-slate-200/70 bg-slate-50",
        size === "sm" ? "px-3 py-2" : "px-5 py-3",
      )}
    >
      {heading}
      {actions && <CardActions>{actions}</CardActions>}
    </div>
  );
}

function CardHeader({
  heading,
  actions,
  size,
}: {
  heading: ReactNode;
  actions: ReactNode;
  size: ControlSize;
}) {
  if (!actions) return heading;
  return (
    <div className={cx("flex items-center justify-between gap-3", size === "sm" ? "mb-2" : "mb-3")}>
      {heading}
      <CardActions>{actions}</CardActions>
    </div>
  );
}

/** `dashed` stands alone; `bar` needs a title or actions to fill it and has no tone. */
function cardForm(
  asked: {
    flush?: boolean | undefined;
    bar?: boolean | undefined;
    dashed?: boolean | "filled" | undefined;
    tone?: CalloutTone | undefined;
    size?: ControlSize | undefined;
  },
  hasHeader: boolean,
) {
  const dashed = Boolean(asked.dashed);
  const bar = (asked.bar ?? false) && !dashed && hasHeader;
  return {
    flush: (asked.flush ?? false) && !dashed,
    bar,
    dashed,
    filled: asked.dashed === "filled",
    tone: dashed || bar ? undefined : asked.tone,
    size: asked.size ?? "md",
  };
}

/** The padding of a card's body by `size`. */
const BODY_PAD: Record<ControlSize, string> = { md: "p-5", sm: "p-3" };

function cardBorder(form: ReturnType<typeof cardForm>): string {
  if (form.dashed) return "border-dashed border-slate-300";
  return form.tone ? TONE_SURFACE[form.tone] : "border-slate-200/70 bg-white";
}

function cardPadding(form: ReturnType<typeof cardForm>): string | false {
  if (form.dashed) {
    return cx(form.filled ? "p-10" : "p-8", "text-center text-sm text-slate-500");
  }
  return !form.flush && !form.bar && BODY_PAD[form.size];
}

function cardClass(form: ReturnType<typeof cardForm>): string {
  return cx(
    "rounded-xl border",
    cardBorder(form),
    form.filled && "bg-white",
    cardPadding(form),
    !form.dashed && !form.tone && "shadow-sm",
    (form.flush || form.bar) && "overflow-hidden",
  );
}

/**
 * A bordered panel with an optional title, count and status; `as` picks the element (default `section`).
 * Three opt-in forms for data views: `flush` drops the padding and clips the corners, for a table
 * that runs edge to edge; `bar` puts the title, count and `actions` in a tinted strip across the
 * top, over the body; `dashed` is an empty-state shell, a dashed outline with centred muted text.
 * `dashed` stands alone: it ignores `flush` and `bar`; `dashed="filled"` is the same shell on a
 * surface fill with more padding, for an empty state that must read as a panel. A flush card has no
 * padding for a `title`, so give it a `bar`. `size="sm"` is the dense padding, the same on a
 * `ListRow` and a `FileDrop`. `tone` is the Callout's set, for a data panel that carries a status
 * (a soft fill and border, no shadow); a message is still a `Callout`, and `bar` and `dashed` have
 * no tone. Other props (`id`, `data-*`, `aria-*`) go on the root.
 */
export function Card({
  title,
  count,
  status,
  actions,
  bar,
  flush,
  dashed,
  tone,
  size,
  as: Tag = "section",
  children,
  ...rest
}: {
  title?: string;
  count?: number;
  /** A `Pill` (or any node) directly beside the title and count, not at the far end like `actions`. Needs a `title`. */
  status?: ReactNode;
  /** Buttons or links at the end of the header: in the strip with `bar`, else beside the title. */
  actions?: ReactNode;
  /** Put the title, count and actions in a tinted strip above the body, edge to edge. */
  bar?: boolean;
  /** No padding and `overflow-hidden`: the body (a table, a list) fills the card. */
  flush?: boolean;
  /** An empty-state shell: dashed outline, no shadow, no fill, centred muted text. `"filled"` puts it on a surface fill with more padding. */
  dashed?: boolean | "filled";
  /** A soft fill and border in the Callout's tones, for a data panel with a status. Ignored with `bar` and `dashed`. */
  tone?: CalloutTone;
  /** `sm` is dense padding on the body, heading and bar; a `dashed` shell keeps its own. Defaults to `md`. */
  size?: ControlSize;
  as?: "section" | "article" | "div";
  children: ReactNode;
} & Omit<ComponentPropsWithoutRef<"section">, "title" | "className" | "style" | "children">) {
  const form = cardForm({ flush, bar, dashed, tone, size }, Boolean(title || actions));
  const heading = title && (
    <CardHeading
      title={title}
      count={count}
      status={status}
      bar={form.bar}
      spaced={!form.bar && !actions}
      size={form.size}
    />
  );
  return (
    <Tag {...rest} className={cardClass(form)}>
      {form.bar ? (
        <>
          <CardBar heading={heading} actions={actions} size={form.size} />
          <div className={form.flush ? undefined : BODY_PAD[form.size]}>{children}</div>
        </>
      ) : (
        <>
          <CardHeader heading={heading} actions={actions} size={form.size} />
          {children}
        </>
      )}
    </Tag>
  );
}

/** A coloured epic header row: a dot in the epic's colour + its label. */
export function EpicHeader({
  color,
  label,
  ...rest
}: { color: string; label: string } & Passthrough) {
  return (
    <div {...rest} className="mb-1.5 mt-3 flex items-center gap-2 first:mt-0">
      <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
      <span className="text-sm font-semibold text-slate-700">{label}</span>
    </div>
  );
}

export type PillTone = "slate" | "amber" | "emerald" | "blue" | "red" | "violet" | "sky";

/**
 * A small tinted label; `dot` adds a leading dot in the pill's own text colour, `round` swaps the
 * rounded-md corners for a full pill shape.
 */
export function Pill({
  children,
  tone = "slate",
  dot = false,
  round = false,
  ...rest
}: {
  children: ReactNode;
  tone?: PillTone;
  dot?: boolean;
  round?: boolean;
} & Passthrough) {
  const tones: Record<string, string> = {
    slate: "bg-slate-100 text-slate-600",
    amber: "bg-amber-50 text-amber-700",
    emerald: "bg-emerald-50 text-emerald-700",
    blue: "bg-blue-50 text-blue-700",
    red: "bg-red-50 text-red-900",
    violet: "bg-violet-50 text-violet-700",
    sky: "bg-sky-50 text-sky-700",
  };
  return (
    <span
      {...rest}
      className={cx(
        round ? "rounded-full" : "rounded-md",
        "px-1.5 py-0.5 text-xs font-medium",
        tones[tone],
        dot && "inline-flex items-center gap-1",
      )}
    >
      {dot && <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}

export function Empty({ children, ...rest }: { children: ReactNode } & Passthrough) {
  return (
    <p {...rest} className="text-sm text-slate-400">
      {children}
    </p>
  );
}

function compareEpics(a: string | null, b: string | null): number {
  if (a === null) return 1;
  if (b === null) return -1;
  return a < b ? -1 : 1;
}

/** Group items by their epic ref, ordered with real epics first (by ref) and "No epic" last. */
export function groupByEpic<T>(
  items: T[],
  epicOf: (t: T) => string | null,
): [string | null, T[]][] {
  const groups = new Map<string | null, T[]>();
  for (const item of items) {
    const key = epicOf(item) ?? null;
    const group = groups.get(key);
    if (group) group.push(item);
    else groups.set(key, [item]);
  }
  return [...groups].toSorted(([a], [b]) => compareEpics(a, b));
}
