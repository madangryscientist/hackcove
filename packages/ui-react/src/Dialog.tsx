import {
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
  useId,
  useLayoutEffect,
  useRef,
  type RefObject,
} from "react";
import { cx } from "./cx.js";
import { useModal } from "./modal.js";
import type { Passthrough } from "./props.js";
import { scrollStopProps, TABBABLE, useScrollStop } from "./scrollStop.js";
import type { Size } from "./size.js";
import { AppScale, HeaderText, SectionHeading } from "./typography.js";

/** Shared by every size: the surface, its colours and the fade (and the scrim's) in and out. */
const BASE =
  "bg-white p-0 text-slate-900 whitespace-normal opacity-0 transition-[opacity,translate,overlay,display] transition-discrete duration-200 open:opacity-100 starting:open:opacity-0 backdrop:bg-slate-900/35 backdrop:opacity-0 backdrop:transition-[opacity,overlay,display] backdrop:transition-discrete backdrop:duration-200 open:backdrop:opacity-100 starting:open:backdrop:opacity-0 motion-reduce:transition-none motion-reduce:backdrop:transition-none";
/** A floating panel under the top edge: it also slides down 8px as it fades in. */
const WINDOW =
  "mx-auto mt-28 max-w-[calc(100vw-2rem)] overflow-visible rounded-2xl border border-slate-200 shadow-2xl -translate-y-2 open:translate-y-0 starting:open:-translate-y-2";
const WIDTH: Record<Size, string> = { sm: "w-80", md: "w-110", lg: "w-160" };
/**
 * A windowed dialog is as tall as its content up to the room under its top margin (7rem) with 1rem
 * to spare and its 1px borders, and no taller: the body scrolls inside that cap, so the title and
 * the footer stay on screen. The cap sits on the panel inside the `<dialog>`, which stays
 * `overflow-visible` so a `DateField` calendar portalled into it is not clipped.
 */
const CAP = "max-h-[calc(100dvh-8rem-2px)]";
/**
 * The scrolling body clips what paints outside it, a field's focus ring included. Its padding keeps
 * the ring whole (4px: a 2px outline at a 2px offset), and the negative margins give that room back,
 * so the body sits where an unpadded one would.
 */
const SCROLL_BODY = "mt-3 -mb-1 -mx-1 min-h-0 flex-1 scroll-py-1 overflow-y-auto px-1 pt-1 pb-1";
/** The whole viewport, edge to edge: no margin, radius, border or shadow, and a column so the body can fill it. */
const FULL =
  "fixed inset-0 m-0 size-full max-h-none max-w-none flex-col overflow-hidden rounded-none border-0 open:flex";

/**
 * The body's keyboard side. In a windowed dialog Chromium's `showModal()` focuses a scrolling box
 * ahead of the field inside it, though the other engines pick the field: when the open took the
 * body, the focus goes to the first thing in the dialog the keyboard can reach, where it lands in a
 * dialog that does not scroll. And a body that overflows and holds nothing the keyboard can reach
 * takes a tab stop, so the arrow keys can scroll it. Every other body has none: `showModal()`
 * focuses the first focusable element, and a tab stop on the body would take that from the field
 * inside it. `size="full"` is left as it was.
 */
function useScrollingBody(
  dialog: RefObject<HTMLDialogElement | null>,
  titleId: string,
  full: boolean,
): {
  attach: (el: HTMLDivElement | null) => void;
  props: HTMLAttributes<HTMLDivElement>;
  className: string;
} {
  const { element: body, attach, stop } = useScrollStop();
  const tabStop = stop && !full;

  // After `useModal`'s own layout effect (the caller's earlier hook), so the dialog is open.
  useLayoutEffect(() => {
    if (!full && body && document.activeElement === body) {
      dialog.current?.querySelector<HTMLElement>(TABBABLE)?.focus();
    }
  }, [body, dialog, full]);

  const { props, ring } = scrollStopProps(tabStop, { labelledBy: titleId });
  return {
    attach,
    props,
    className: cx(full ? "mt-4 min-h-0 flex-1 overflow-auto" : SCROLL_BODY, ring),
  };
}

export type DialogProps = {
  /** The dialog's accessible name, shown as its heading. */
  title: ReactNode;
  /** A muted line under the title. */
  description?: ReactNode;
  children?: ReactNode;
  /** Actions under the body, right-aligned. A submit button here can reach a form in the body with its `form` attribute. */
  footer?: ReactNode;
  /**
   * The panel's width: `sm` (320px) is a list, `md` (440px) holds a form, `lg` (640px) a wider
   * form or a table. `full` fills the whole screen, for media or a player: the body takes the
   * height between the header and the footer and scrolls if it is taller. It has no backdrop to
   * click, so give it a close action in the `footer` (a `<form method="dialog">` button).
   * @default md
   */
  size?: Size | "full";
  /** Called when the dialog closes: Esc, a click on the backdrop, or a `<form method="dialog">` submit. */
  onClose: () => void;
} & Passthrough;

/**
 * A modal on the browser's own `<dialog>`: it is opened with `showModal()` on mount, so render it
 * only while it is open. The page behind goes inert, Esc closes it and focus stays inside; a click
 * on the backdrop (the `<dialog>` element itself, not its contents) closes it too. A windowed dialog is
 * never taller than the screen: a tall body scrolls and the title and footer stay on screen.
 */
export function Dialog({
  title,
  description,
  children,
  footer,
  size = "md",
  onClose,
  ...rest
}: DialogProps): ReactElement {
  const dialog = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  const closed = useModal(dialog, onClose);
  const full = size === "full";

  const {
    attach,
    props: bodyProps,
    className: bodyClass,
  } = useScrollingBody(dialog, titleId, full);

  return (
    <AppScale>
      <dialog
        {...rest}
        ref={dialog}
        aria-labelledby={titleId}
        onClose={closed}
        onClick={(event) => event.target === dialog.current && dialog.current?.close()}
        className={cx(BASE, size === "full" ? FULL : `${WINDOW} ${WIDTH[size]}`)}
      >
        <div className={cx("flex flex-col p-5.5", full ? "min-h-0 flex-1" : CAP)}>
          <SectionHeading id={titleId}>{title}</SectionHeading>
          {description && (
            <div className="mt-1">
              <HeaderText>{description}</HeaderText>
            </div>
          )}
          {children && (
            <div ref={attach} {...bodyProps} className={bodyClass}>
              {children}
            </div>
          )}
          {footer && <div className="mt-5 flex shrink-0 justify-end gap-2">{footer}</div>}
        </div>
      </dialog>
    </AppScale>
  );
}
