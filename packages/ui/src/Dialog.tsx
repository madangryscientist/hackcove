import { type ReactElement, type ReactNode, useEffect, useId, useRef } from "react";
import { cx } from "./cx.js";
import { Subtitle, ModalHeading } from "./typography.js";

const PANEL =
  "mx-auto mt-28 max-w-[calc(100vw-2rem)] rounded-2xl border border-slate-200 bg-white p-0 text-slate-900 shadow-2xl backdrop:bg-slate-900/35";
const SIZE = { sm: "w-80", md: "w-110" } as const;

export type DialogProps = {
  /** The dialog's accessible name, shown as its heading. */
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  /** Actions under the body, right-aligned. A submit button here can reach a form in the body with its `form` attribute. */
  footer?: ReactNode;
  /** `sm` is a list; `md` (the default) holds a form. */
  size?: keyof typeof SIZE;
  /** Called when the dialog closes: Esc, a click on the backdrop, or a `<form method="dialog">` submit. */
  onClose: () => void;
  className?: string;
};

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
  className,
}: DialogProps): ReactElement {
  const dialog = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    dialog.current?.showModal();
  }, []);

  return (
    <dialog
      ref={dialog}
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(event) => event.target === dialog.current && dialog.current?.close()}
      className={cx(PANEL, SIZE[size], className)}
    >
      <div className="p-5.5">
        <ModalHeading id={titleId}>{title}</ModalHeading>
        {description && <Subtitle className="mt-1">{description}</Subtitle>}
        {children && <div className="mt-4">{children}</div>}
        {footer && <div className="mt-5 flex justify-end gap-2">{footer}</div>}
      </div>
    </dialog>
  );
}
