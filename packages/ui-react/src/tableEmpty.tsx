import { type ReactElement, type ReactNode, useContext } from "react";
import { cx } from "./cx.js";
import { EmptySlot } from "./emptySlot.js";
import { TableContext } from "./tableColumns.js";
import { BODY_LINE, PAD } from "./tableRow.js";

/**
 * A table body's one row when it has no rows: a cell across every column the head declares, holding
 * `empty` at the slot's small size. Internal to `TableBody`.
 */
export function EmptyRow({ children }: { children: ReactNode }): ReactElement {
  const { columns, size } = useContext(TableContext);
  return (
    <tr className={BODY_LINE}>
      <td colSpan={columns ?? 1} className={cx(PAD[size].cell, "text-center")}>
        <EmptySlot size="sm">{children}</EmptySlot>
      </td>
    </tr>
  );
}
