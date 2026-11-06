import type { ComponentProps, ReactElement, ReactNode } from "react";
import { InlineEdit } from "./InlineEdit.js";
import { TableCell } from "./Table.js";

/**
 * A `TableCell` whose value opens an editor in place: a cell that holds one `InlineEdit` and
 * nothing else. It shows `children` as a button with a dotted underline; a click, Enter or Space
 * swaps it for `renderEditor(close)` and moves the focus into the editor. The editor calls `close`
 * when it has saved, and Esc closes it: both put the focus back on the value. A press outside it or
 * Tab out of it closes it too and leaves the focus where it went, so the editor saves its value on
 * its own change or submit, never on a close. Put the control in the cell itself, not in a popover
 * of its own, which counts as outside. Takes `TableCell`'s `align`, `tone`, `numeric`, `mono`,
 * `indent` and `secondary`. For an edit trigger in a cell that holds other content too, put an
 * `InlineEdit` in a `TableCell`.
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
  return (
    <TableCell {...cell}>
      <InlineEdit label={label} renderEditor={renderEditor}>
        {children}
      </InlineEdit>
    </TableCell>
  );
}
