import {
  Children,
  createContext,
  createElement,
  Fragment,
  isValidElement,
  type ReactNode,
  useContext,
} from "react";
import type { Size } from "./size.js";

/**
 * What a `Table` tells the rows and cells inside it: whether it sits in a card (plain), its row
 * density, and which columns its head declares numeric. Internal: not exported from the package.
 */
type TableSetting = {
  plain: boolean;
  size: Size;
  numeric: readonly boolean[];
  /** How many columns the head declares, or `undefined` with no `TableHead`. */
  columns: number | undefined;
};

export const TableContext = createContext<TableSetting>({
  plain: false,
  size: "sm",
  numeric: [],
  columns: undefined,
});

/** The column a cell starts at, set by its `TableRow`. */
const ColumnContext = createContext<number | undefined>(undefined);

type CellProps = { children?: ReactNode; colSpan?: unknown; numeric?: unknown };

/** The children as one flat list: arrays and fragments are opened, so a mapped or grouped list counts as its items. */
function flat(children: ReactNode): ReactNode[] {
  return Children.toArray(children).flatMap((child) =>
    isValidElement<CellProps>(child) && child.type === Fragment
      ? flat(child.props.children)
      : [child],
  );
}

/** How many columns an element takes: its `colSpan`, else one. */
function span(props: CellProps): number {
  return typeof props.colSpan === "number" && props.colSpan > 0 ? props.colSpan : 1;
}

/** The first child of the given component type. */
function first(children: ReactNode, type: unknown) {
  return flat(children).find((child) => isValidElement<CellProps>(child) && child.type === type);
}

/**
 * Which columns the head declares numeric, read from the element props of the table's first head
 * row (`head` and `row` are the `TableHead` and `TableRow` components). A head row drawn by an app's
 * own component is not seen; its body cells then say `numeric` themselves.
 */
export function numericColumns(children: ReactNode, head: unknown, row: unknown): boolean[] {
  const headElement = first(children, head);
  if (!isValidElement<CellProps>(headElement)) return [];
  const rowElement = first(headElement.props.children, row);
  if (!isValidElement<CellProps>(rowElement)) return [];
  return flat(rowElement.props.children).flatMap((cell) =>
    isValidElement<CellProps>(cell)
      ? Array.from({ length: span(cell.props) }, () => cell.props.numeric === true)
      : [],
  );
}

/**
 * How many columns the table has: the largest total of `colSpan`s (one each when unset) over the
 * rows of its `TableHead`, read through arrays and fragments. `undefined` when there is no head;
 * a head drawn by an app's own component is not seen either.
 */
export function columnCount(children: ReactNode, head: unknown, row: unknown): number | undefined {
  const headElement = first(children, head);
  if (!isValidElement<CellProps>(headElement)) return undefined;
  const totals = flat(headElement.props.children)
    .filter((child) => isValidElement<CellProps>(child) && child.type === row)
    .map((rowElement) =>
      isValidElement<CellProps>(rowElement)
        ? flat(rowElement.props.children).reduce<number>(
            (sum, cell) => sum + (isValidElement<CellProps>(cell) ? span(cell.props) : 0),
            0,
          )
        : 0,
    );
  return totals.length === 0 ? undefined : Math.max(...totals);
}

/** A row's cells, each told the column it starts at (counting `colSpan`). */
export function withColumns(children: ReactNode): ReactNode[] {
  let column = 0;
  return flat(children).map((child) => {
    if (!isValidElement<CellProps>(child)) return child;
    const at = column;
    column += span(child.props);
    return createElement(ColumnContext.Provider, { key: at, value: at }, child);
  });
}

/** Whether the head declared this cell's column numeric. */
export function useNumericColumn(): boolean {
  const at = useContext(ColumnContext);
  const { numeric } = useContext(TableContext);
  return at !== undefined && numeric[at] === true;
}
