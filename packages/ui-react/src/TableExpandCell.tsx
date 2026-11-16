import type { MouseEventHandler, ReactElement } from "react";
import { Button } from "./Button.js";
import { Chevron } from "./Chevron.js";
import type { Passthrough } from "./props.js";
import { TableCell } from "./TableCells.js";

/**
 * The cell that opens and closes the row it sits in: a small ghost button with a chevron that turns
 * down when `expanded`, named by `label` (visually hidden) and, with a `count`, the count chip after
 * it, so it reads "Details, 3". The app holds `expanded` and renders what opens under the row: a
 * `TableRow` with one `TableCell span="full"`, or indented child rows. Give its column a head of
 * `<TableHeaderCell label="Details" />`. `aria-controls` names what it opens; other props go on the
 * `<td>`.
 */
export function TableExpandCell({
  expanded,
  label,
  count,
  onClick,
  "aria-controls": controls,
  ...rest
}: {
  /** Whether the row is open. */
  expanded: boolean;
  /** The button's name, visually hidden: "Details". */
  label: string;
  /** A count chip after the chevron: how many lines open under the row. */
  count?: number | undefined;
  /** Opens or closes the row: the app flips `expanded`. */
  onClick: MouseEventHandler<HTMLButtonElement>;
} & Passthrough): ReactElement {
  return (
    <TableCell {...rest}>
      <Button
        variant="ghost"
        size="sm"
        aria-expanded={expanded}
        aria-controls={controls}
        count={count}
        onClick={onClick}
      >
        <Chevron open={expanded} />
        <span className="sr-only">{label}</span>
      </Button>
    </TableCell>
  );
}
