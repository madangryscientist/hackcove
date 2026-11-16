import { type ReactElement, type ReactNode, useId, useRef } from "react";
import { cx } from "./cx.js";
import { BodyContext, ModalScope } from "./Dialog.js";
import { IconButton } from "./IconButton.js";
import { useModal } from "./modal.js";
import type { Passthrough } from "./props.js";
import type { Size } from "./size.js";
import { HeaderText, SectionHeading } from "./typography.js";

const PANEL =
  "fixed inset-y-0 right-0 left-auto m-0 h-dvh max-h-none max-w-full flex-col overflow-hidden border-l border-slate-200 bg-white p-0 text-slate-900 shadow-2xl translate-x-full transition-[translate,overlay,display] transition-discrete duration-200 open:flex open:translate-x-0 starting:open:translate-x-full backdrop:bg-slate-900/35 backdrop:opacity-0 backdrop:transition-[opacity,overlay,display] backdrop:transition-discrete backdrop:duration-200 open:backdrop:opacity-100 starting:open:backdrop:opacity-0 motion-reduce:transition-none motion-reduce:backdrop:transition-none";
const WIDTH: Record<Size, string> = { sm: "w-80", md: "w-110", lg: "w-160" };

export type DrawerProps = {
  /** The drawer's accessible name, shown as its heading. */
  title: ReactNode;
  /** A muted line under the title, as on a `Dialog`. */
  description?: ReactNode;
  children?: ReactNode;
  /** Actions pinned under the scrolling body, right-aligned. */
  footer?: ReactNode;
  /**
   * The panel's width: `md` holds a form or a record; `sm` (320px) is narrower and `lg` (640px) wider.
   * @default md
   */
  width?: Size | undefined;
  /** Called when the drawer closes: Esc, a click on the scrim or the close button. */
  onClose: () => void;
  /** The accessible name of the close button. */
  closeLabel?: string;
} & Passthrough;

/**
 * A modal slide-over anchored to the right edge, on the browser's own `<dialog>`: it is opened
 * with `showModal()` on mount, so render it only while it is open. The page behind goes inert, Esc
 * closes it and focus stays inside; a click on the scrim (the `<dialog>` element itself, not its
 * contents) closes it too. The header holds the title, an optional `description` under it and a
 * close button; the body scrolls between
 * it and an optional pinned `footer`.
 */
export function Drawer({
  title,
  description,
  children,
  footer,
  width = "md",
  onClose,
  closeLabel = "Close",
  ...rest
}: DrawerProps): ReactElement {
  const dialog = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  const closed = useModal(dialog, onClose);

  return (
    <ModalScope>
      <dialog
        {...rest}
        ref={dialog}
        aria-labelledby={titleId}
        onClose={closed}
        onClick={(event) => event.target === dialog.current && dialog.current?.close()}
        className={cx(PANEL, WIDTH[width])}
      >
        <header className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-200 px-5.5 py-3.5">
          <div className="min-w-0">
            <SectionHeading id={titleId}>{title}</SectionHeading>
            {description && (
              <div className="mt-1">
                <HeaderText>{description}</HeaderText>
              </div>
            )}
          </div>
          <IconButton label={closeLabel} onClick={() => dialog.current?.close()} icon="close" />
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto px-5.5 py-4">
          <BodyContext>{children}</BodyContext>
        </div>
        {footer && (
          <footer className="flex shrink-0 justify-end gap-2 border-t border-slate-200 px-5.5 py-3.5">
            {footer}
          </footer>
        )}
      </dialog>
    </ModalScope>
  );
}
