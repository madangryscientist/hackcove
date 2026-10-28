import { type ReactElement, type ReactNode, useId, useRef } from "react";
import { cx } from "./cx.js";
import { Icon } from "./Icon.js";
import { IconButton } from "./IconButton.js";
import { useModal } from "./modal.js";
import type { Passthrough } from "./props.js";
import { SectionHeading } from "./typography.js";

const PANEL =
  "fixed inset-y-0 right-0 left-auto m-0 h-dvh max-h-none max-w-full flex-col overflow-hidden border-l border-slate-200 bg-white p-0 text-slate-900 shadow-2xl backdrop:bg-slate-900/35 open:flex transition-transform duration-200 starting:open:translate-x-full motion-reduce:transition-none";
const SIZE = { sm: "w-80", md: "w-110", lg: "w-160" } as const;

export type DrawerProps = {
  /** The drawer's accessible name, shown as its heading. */
  title: ReactNode;
  children?: ReactNode;
  /** Actions pinned under the scrolling body, right-aligned. */
  footer?: ReactNode;
  /** `md` (the default) holds a form or a record; `sm` is narrower and `lg` wider. */
  size?: keyof typeof SIZE;
  /** Called when the drawer closes: Esc, a click on the scrim or the close button. */
  onClose: () => void;
  /** The accessible name of the close button. */
  closeLabel?: string;
} & Passthrough;

/**
 * A modal slide-over anchored to the right edge, on the browser's own `<dialog>`: it is opened
 * with `showModal()` on mount, so render it only while it is open. The page behind goes inert, Esc
 * closes it and focus stays inside; a click on the scrim (the `<dialog>` element itself, not its
 * contents) closes it too. The header holds the title and a close button; the body scrolls between
 * it and an optional pinned `footer`.
 */
export function Drawer({
  title,
  children,
  footer,
  size = "md",
  onClose,
  closeLabel = "Close",
  ...rest
}: DrawerProps): ReactElement {
  const dialog = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useModal(dialog);

  return (
    <dialog
      {...rest}
      ref={dialog}
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(event) => event.target === dialog.current && dialog.current?.close()}
      className={cx(PANEL, SIZE[size])}
    >
      <header className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-200 px-5.5 py-3.5">
        <SectionHeading id={titleId}>{title}</SectionHeading>
        <IconButton label={closeLabel} onClick={() => dialog.current?.close()}>
          <Icon>
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path d="M5.28 4.22a.75.75 0 0 0-1.06 1.06L8.94 10l-4.72 4.72a.75.75 0 1 0 1.06 1.06L10 11.06l4.72 4.72a.75.75 0 1 0 1.06-1.06L11.06 10l4.72-4.72a.75.75 0 0 0-1.06-1.06L10 8.94 5.28 4.22Z" />
            </svg>
          </Icon>
        </IconButton>
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto px-5.5 py-4">{children}</div>
      {footer && (
        <footer className="flex shrink-0 justify-end gap-2 border-t border-slate-200 px-5.5 py-3.5">
          {footer}
        </footer>
      )}
    </dialog>
  );
}
