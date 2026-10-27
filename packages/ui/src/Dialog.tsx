import { type ReactElement, type ReactNode, useEffect, useId, useRef } from "react";
import { cx } from "./cx.js";
import type { Passthrough } from "./props.js";
import type { Size } from "./size.js";
import { Subtitle, ModalHeading } from "./typography.js";

const PANEL =
  "mx-auto mt-28 max-w-[calc(100vw-2rem)] overflow-visible rounded-2xl border border-slate-200 bg-white p-0 text-slate-900 shadow-2xl backdrop:bg-slate-900/35";
const SIZE: Record<Size, string> = { sm: "w-80", md: "w-110", lg: "w-160" };

export type DialogProps = {
  /** The dialog's accessible name, shown as its heading. */
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  /** Actions under the body, right-aligned. A submit button here can reach a form in the body with its `form` attribute. */
  footer?: ReactNode;
  /**
   * The panel's width: `sm` (320px) is a list, `md` (440px) holds a form, `lg` (640px) a wider
   * form or a table.
   * @default md
   */
  size?: Size;
  /** Called when the dialog closes: Esc, a click on the backdrop, or a `<form method="dialog">` submit. */
  onClose: () => void;
} & Passthrough;

/**
 * A modal on the browser's own `<dialog>`: it is opened with `showModal()` on mount, so render it
 * only while it is open. The page behind goes inert, Esc closes it and focus stays inside; a click
 * on the backdrop (the `<dialog>` element itself, not its contents) closes it too.
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

  useEffect(() => {
    dialog.current?.showModal();
  }, []);

  return (
    <dialog
      {...rest}
      ref={dialog}
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(event) => event.target === dialog.current && dialog.current?.close()}
      className={cx(PANEL, SIZE[size])}
    >
      <div className="p-5.5">
        <ModalHeading id={titleId}>{title}</ModalHeading>
        {description && (
          <div className="mt-1">
            <Subtitle>{description}</Subtitle>
          </div>
        )}
        {children && <div className="mt-4">{children}</div>}
        {footer && <div className="mt-5 flex justify-end gap-2">{footer}</div>}
      </div>
    </dialog>
  );
}
