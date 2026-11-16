import { type ReactElement, type ReactNode, useId } from "react";
import { Chevron } from "./Chevron.js";
import { cx, focusRing, liftInteractive } from "./cx.js";
import { DensityProvider } from "./density.js";
import { renderLink } from "./link.js";
import type { Size } from "./size.js";
import { GapProvider } from "./stackGap.js";
import { LoadingScope, useLoading } from "./skeleton.js";
import { waitingRow } from "./listRowWait.js";
import { SELECTED } from "./tableRow.js";
import { hasReason, useBlocked } from "./blocked.js";
import type {
  ListRowButtonProps,
  ListRowLinkProps,
  ListRowProps,
  ListRowStaticProps,
} from "./listRowProps.js";

export type { ListRowProps } from "./listRowProps.js";

const ROW_LOOK = "flex w-full items-center gap-3 text-left text-sm text-slate-900";

const INSET_RING = `${focusRing} focus-visible:-outline-offset-2`;

/**
 * A button or linked row is a `relative` box; its button or link is an empty overlay, so the row's
 * own links and buttons are not nested in it.
 */
const LINK_ROW = `relative ${ROW_LOOK} ${liftInteractive}`;

const OVERLAY = `link-stretch absolute inset-0 ${INSET_RING}`;

/** A disabled button row: faded, whatever its fill. Its overlay button is disabled, so the row does not fire. */
const DISABLED = "opacity-50";

const STATIC = "group/row flex w-full items-center gap-3 text-sm text-slate-900";

/**
 * A static row with a `panel`: the row's own line (the label, `trailing`, `actions`) over the panel,
 * `leading` in a column of its own beside both, so the detail starts where the label does.
 */
const STATIC_PANEL = "group/row grid w-full items-center gap-3 text-sm text-slate-900";
const PANEL_COLUMNS = {
  withLeading: "grid-cols-[auto_minmax(0,1fr)]",
  alone: "grid-cols-[minmax(0,1fr)]",
};

const FILL = "hover:bg-slate-50";
/**
 * The row a pointer or keyboard cursor is on: the inset fill, one step deeper than hover, so it
 * still shows on a `bg-slate-50` surface (a `FullBleedLayout` panel, a toned card).
 */
const HIGHLIGHTED = "bg-slate-100";

/** The keyboard cursor: the focus ring, drawn inside the row, on a row that does not hold DOM focus. */
const FOCUSED = "outline-2 -outline-offset-2 outline-violet-600";

/** A thumbnail's width. A direct-child image fills it. */
const THUMBNAIL = "block w-32 [&>img]:block [&>img]:h-auto [&>img]:w-full";

/**
 * Hidden until the row is hovered or has focus inside it; always shown where any pointer is coarse
 * (a touch screen, hybrids included), and while a `Menu` in it is open, since its menu takes the
 * focus out of the row.
 */
const REVEAL =
  "opacity-0 group-hover/row:opacity-100 group-focus-within/row:opacity-100 any-pointer-coarse:opacity-100 has-[[aria-expanded=true]]:opacity-100";

const PAD: Record<Size, string> = { sm: "px-3 py-2", md: "px-4 py-3", lg: "px-5 py-4" };

type Pieces = { start: ReactNode; label: ReactNode; end: ReactNode };

/** A row with no `href` and no `onClick` is static: it does nothing of its own. */
function isStatic(props: ListRowProps): props is ListRowStaticProps {
  return props.href === undefined && props.onClick === undefined;
}

/** The row's background: the selected fill, else the hover fill unless a plain static row has none. */
function fillOf(props: ListRowProps): string | undefined {
  if (props.selected) return SELECTED;
  if (props.highlighted) return HIGHLIGHTED;
  if (isDisabled(props)) return undefined;
  return isStatic(props) && !props.revealOnHover ? undefined : FILL;
}

/** A button row with `disabled` or `disabledReason`: it fades and takes no hover fill. */
function isDisabled(props: ListRowProps): boolean {
  if (hasReason(props.disabledReason)) return true;
  return !isStatic(props) && "disabled" in props && props.disabled === true;
}

/** `panel={open && <Panel />}` is a common way to write it, so `false` is as empty as `null`. */
function hasPanel(panel: ReactNode): boolean {
  return panel != null && panel !== false;
}

function rowBase(props: ListRowProps): string {
  if (!isStatic(props)) return LINK_ROW;
  return hasPanel(props.panel) ? STATIC_PANEL : STATIC;
}

function look(props: ListRowProps): string {
  const { size = "md", divided = false, focused = false } = props;
  return cx(
    rowBase(props),
    PAD[size],
    divided && "border-t border-slate-200/70",
    fillOf(props),
    isDisabled(props) && DISABLED,
    focused && FOCUSED,
  );
}

function StaticRow(props: ListRowStaticProps & Pieces): ReactElement {
  const {
    leading: _l,
    secondary: _sec,
    leadingWidth: _lw,
    trailing: _t,
    focused: _f,
    highlighted = false,
    selected,
    size: _s,
    divided: _d,
    actions,
    revealOnHover = false,
    panel,
    expanded: _e,
    onClick: _o,
    href: _h,
    start,
    label,
    end,
    ...rest
  } = props;
  const buttons = actions != null && (
    <span
      className={cx("flex shrink-0 items-center gap-2", revealOnHover && !highlighted && REVEAL)}
    >
      {actions}
    </span>
  );
  const withPanel = hasPanel(panel);
  return (
    <div
      {...rest}
      {...(selected ? { "aria-current": "true" as const } : {})}
      className={cx(look(props), withPanel && PANEL_COLUMNS[start ? "withLeading" : "alone"])}
    >
      {withPanel ? (
        <PanelLines start={start} panel={panel}>
          {label}
          {end}
          {buttons}
        </PanelLines>
      ) : (
        <>
          {start}
          {label}
          {end}
          {buttons}
        </>
      )}
    </div>
  );
}

/** The cells of a static row with a `panel`: `start` beside the row's line (its children), over the panel in the label's column. */
function PanelLines({
  start,
  panel,
  children,
}: {
  start: ReactNode;
  panel: ReactNode;
  children: ReactNode;
}): ReactElement {
  return (
    <>
      {start}
      <div className="flex min-w-0 items-center gap-3">{children}</div>
      <div className={cx("min-w-0", Boolean(start) && "col-start-2")}>{panel}</div>
    </>
  );
}

function LinkRow(props: ListRowLinkProps & Pieces): ReactElement {
  const {
    leading: _l,
    secondary: _sec,
    leadingWidth: _lw,
    trailing: _t,
    focused: _f,
    highlighted: _hl,
    selected,
    expanded: _e,
    size: _s,
    divided: _d,
    actions: _a,
    revealOnHover: _rh,
    panel: _p,
    start,
    label,
    end,
    onPointerEnter,
    onPointerLeave,
    ...rest
  } = props;
  const rowId = useId();
  return (
    <div
      id={rowId}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
      className={look(props)}
    >
      {renderLink({
        ...(rest["aria-label"] === undefined ? { "aria-labelledby": rowId } : {}),
        ...rest,
        ...(selected ? { "aria-current": "true" as const } : {}),
        className: OVERLAY,
        children: null,
      })}
      {start}
      {label}
      {end}
    </div>
  );
}

function ButtonRow(props: ListRowButtonProps & Pieces & { labelId: string }): ReactElement {
  const {
    leading: _l,
    secondary: _sec,
    leadingWidth: _lw,
    trailing: _t,
    focused: _f,
    highlighted: _hl,
    selected,
    expanded,
    size: _s,
    divided: _d,
    actions: _a,
    revealOnHover: _rh,
    panel: _p,
    href: _h,
    start,
    label,
    end,
    labelId,
    children: _c,
    onPointerEnter,
    onPointerLeave,
    disabledReason,
    ...rest
  } = props;
  const { props: guard, tooltip, blocked } = useBlocked(disabledReason, rest);
  return (
    <div onPointerEnter={onPointerEnter} onPointerLeave={onPointerLeave} className={look(props)}>
      <button
        type="button"
        {...(rest["aria-label"] === undefined ? { "aria-labelledby": labelId } : {})}
        {...rest}
        {...guard}
        {...(selected ? { "aria-current": "true" as const } : {})}
        {...(expanded === undefined ? {} : { "aria-expanded": expanded })}
        className={cx(OVERLAY, blocked && "cursor-not-allowed")}
      />
      {tooltip}
      {expanded !== undefined && <Chevron open={expanded} />}
      {start}
      {label}
      {end}
    </div>
  );
}

/**
 * A full-width row that runs `onClick` (or, with `href`, opens a link) with a hover
 * fill, a left-aligned label and `trailing` content at the far end. The row is a `<div>` with its
 * `<button>` or link stretched over it, so a tap anywhere on the row runs it; a `TextLink`,
 * `Button` or `Checkbox` in the row (in `trailing`, say a "View" link on a row that selects) sits
 * above it and is clickable on its own. A button row's button is named by the label alone. With `expanded` it is the header of a
 * collapsible section: `aria-expanded` and a chevron. Rows sit in a `Card flush`; `divided` draws
 * the line between them, on each row after the first.
 *
 * `secondary` is a second, muted line under the label. `leading` is content before the label (`leadingWidth="thumbnail"` gives it a fixed picture width),
 * `selected` marks the row in view, `focused` the one the keyboard cursor is on and `highlighted` fills
 * the row a list follows (`onPointerEnter`, `onPointerLeave` and `onFocus` reach
 * every form; on a button or linked row the pointer handlers go on the row itself). The label is a
 * `<div>`, so it can hold block content (a name over a path). A row with no `href` and no
 * `onClick` is a plain `<div>` with no action of its own, for one that holds its own buttons:
 * `actions` follow `trailing`, and `revealOnHover` shows them only on hover or focus. Such a row
 * also takes a `panel`, content under the row that starts where the label does (a conversation
 * that opens under its chat); `divided` draws the line above the whole row, panel included, so a
 * list of them is `divided={index > 0}` on each. Inside a row a `Stack` is `xs` apart, and a `sm`
 * row makes the buttons in it `sm`. While `loading` an empty label is a bone, and what the row holds
 * waits with it.
 */
export function ListRow(props: ListRowProps): ReactElement {
  const labelId = useId();
  const { loading, owner } = useLoading(props.loading);
  return (
    <GapProvider gap="xs">
      <DensityProvider size={props.size === "sm" ? "sm" : null}>
        <LoadingScope loading={loading}>
          {rowOf(waitingRow(props, loading, owner), labelId)}
        </LoadingScope>
      </DensityProvider>
    </GapProvider>
  );
}

/** The row in its form: static with no `href` or `onClick`, a link with `href`, else a button. */
function rowOf(props: ListRowProps, labelId: string): ReactElement {
  if (isStatic(props)) return <StaticRow {...props} {...piecesOf(props)} />;
  if (props.href !== undefined) return <LinkRow {...props} {...piecesOf(props)} />;
  return <ButtonRow {...props} {...piecesOf(props, labelId)} labelId={labelId} />;
}

/** The row's cells. `labelId` names the label, for a button row's button to be labelled by it. */
function piecesOf(props: ListRowProps, labelId?: string): Pieces {
  const { leading, leadingWidth, trailing, secondary, children } = props;
  return {
    start: leading != null && (
      <span className={cx("shrink-0", leadingWidth === "thumbnail" && THUMBNAIL)}>{leading}</span>
    ),
    label: (
      <div id={labelId} className="min-w-0 flex-1">
        {children}
        {secondary != null && secondary !== false && (
          <div className="text-xs font-normal text-slate-500">{secondary}</div>
        )}
      </div>
    ),
    end: trailing != null && (
      <span className="shrink-0 tabular-nums text-slate-500">{trailing}</span>
    ),
  };
}
