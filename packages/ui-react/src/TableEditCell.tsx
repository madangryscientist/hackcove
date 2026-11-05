import { useCallback, useEffect, useRef, useState } from "react";
import type { ComponentProps, KeyboardEvent, ReactElement, ReactNode } from "react";
import { cx, focusRing } from "./cx.js";
import { TableCell } from "./Table.js";

/** What takes the focus when the editor opens, unless the editor already took it (`autoFocus`). */
const FOCUSABLE = "input, select, textarea, button, a[href]";

/** `returning` is closed with the focus going back to the value; `closed` leaves the focus where it is. */
type Phase = "closed" | "open" | "returning";

/** Whether `target` is a node outside `box`. */
function isOutside(box: HTMLElement | null, target: EventTarget | null): boolean {
  return target instanceof Node && box !== null && !box.contains(target);
}

/** Closes the editor when a press lands outside `box`, for as long as `open`. */
function useDismissOnOutsidePress(
  box: { current: HTMLElement | null },
  open: boolean,
  dismiss: () => void,
): void {
  useEffect(() => {
    if (!open) return undefined;
    const onPress = (event: PointerEvent) => {
      if (isOutside(box.current, event.target)) dismiss();
    };
    document.addEventListener("pointerdown", onPress);
    return () => document.removeEventListener("pointerdown", onPress);
  }, [box, open, dismiss]);
}

/**
 * A `TableCell` whose value opens an editor in place. It shows `children` as a button with a dotted
 * underline; a click, Enter or Space swaps it for `renderEditor(close)` and moves the focus into the
 * editor. The cell keeps its own open state. The editor calls `close` when it has saved, and Esc
 * closes it: both put the focus back on the value. A press outside it or Tab out of it closes it too and leaves the
 * focus where it went, so the editor saves its value on its own change or submit, never on a close.
 * Put the control in the cell itself, not in a popover of its own, which counts as outside. Takes
 * `TableCell`'s `align`, `tone`, `numeric`, `mono`, `indent` and `secondary`.
 */
export function TableEditCell({
  label,
  renderEditor,
  children,
  ...cell
}: {
  /** What the button does, for a screen reader, heard after the value: "Edit category". It also names the editor. */
  label: string;
  /** The control that edits the value, drawn while open. `close` shuts it and returns the focus to the value. */
  renderEditor: (close: () => void) => ReactNode;
  /** The value, shown while closed. */
  children: ReactNode;
} & Omit<ComponentProps<typeof TableCell>, "children" | "truncate">): ReactElement {
  const [phase, setPhase] = useState<Phase>("closed");
  const open = phase === "open";
  const box = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const dismiss = useCallback(() => setPhase("closed"), []);
  const close = () => setPhase("returning");
  useDismissOnOutsidePress(box, open, dismiss);
  useEffect(() => {
    if (phase === "returning") trigger.current?.focus();
    if (phase === "open" && !box.current?.contains(document.activeElement))
      box.current?.querySelector<HTMLElement>(FOCUSABLE)?.focus();
  }, [phase]);
  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key !== "Escape") return;
    event.preventDefault();
    event.stopPropagation();
    close();
  };
  return (
    <TableCell {...cell}>
      {open ? (
        <div
          ref={box}
          role="group"
          aria-label={label}
          className="-mx-2 -my-1"
          onKeyDown={onKeyDown}
          onBlur={(event) => {
            if (isOutside(event.currentTarget, event.relatedTarget)) dismiss();
          }}
        >
          {renderEditor(close)}
        </div>
      ) : (
        <button
          ref={trigger}
          type="button"
          onClick={() => setPhase("open")}
          className={cx(
            "-mx-2 -my-1 block w-[calc(100%+1rem)] cursor-pointer rounded-md px-2 py-1 [text-align:inherit] underline decoration-dotted underline-offset-4 transition hover:bg-slate-100",
            focusRing,
          )}
        >
          {children}
          <span className="sr-only"> {label}</span>
        </button>
      )}
    </TableCell>
  );
}
