import { type ReactElement, type ReactNode, useId, useRef } from "react";
import { cx } from "./cx.js";
import { useModal } from "./modal.js";
import type { Passthrough } from "./props.js";
import type { Size } from "./size.js";
import { HeaderText, SectionHeading } from "./typography.js";

const PANEL =
  "mx-auto mt-28 max-w-[calc(100vw-2rem)] overflow-visible rounded-2xl border border-slate-200 bg-white p-0 text-slate-900 shadow-2xl -translate-y-2 opacity-0 transition-[opacity,translate,overlay,display] transition-discrete duration-200 open:translate-y-0 open:opacity-100 starting:open:-translate-y-2 starting:open:opacity-0 backdrop:bg-slate-900/35 backdrop:opacity-0 backdrop:transition-[opacity,overlay,display] backdrop:transition-discrete backdrop:duration-200 open:backdrop:opacity-100 starting:open:backdrop:opacity-0 motion-reduce:transition-none motion-reduce:backdrop:transition-none";
const SIZE: Record<Size, string> = { sm: "w-80", md: "w-110", lg: "w-160" };

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

  const closed = useModal(dialog, onClose);

  return (
    <dialog
      {...rest}
      ref={dialog}
      aria-labelledby={titleId}
      onClose={closed}
      onClick={(event) => event.target === dialog.current && dialog.current?.close()}
      className={cx(PANEL, SIZE[size])}
    >
      <div className="p-5.5">
        <SectionHeading id={titleId}>{title}</SectionHeading>
        {description && (
          <div className="mt-1">
            <HeaderText>{description}</HeaderText>
          </div>
        )}
        {children && <div className="mt-4">{children}</div>}
        {footer && <div className="mt-5 flex justify-end gap-2">{footer}</div>}
      </div>
    </dialog>
  );
}
