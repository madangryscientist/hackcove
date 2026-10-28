import { type RefObject, useLayoutEffect } from "react";

/**
 * Opens the `<dialog>` with `showModal()` on mount and closes it on unmount. Closing on unmount
 * (not just on Esc or the backdrop) hands focus back to the opener and drops the inert page behind
 * when the parent unmounts the dialog, and keeps StrictMode's second mount from reopening an open one.
 */
export function useModal(dialog: RefObject<HTMLDialogElement | null>): void {
  useLayoutEffect(() => {
    const el = dialog.current;
    el?.showModal();
    return () => el?.close();
  }, [dialog]);
}
