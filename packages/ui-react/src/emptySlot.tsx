import { Children, createContext, type ReactElement, type ReactNode, useContext } from "react";

/*
   The empty slot. Internal: not exported from the package.

   Every part that holds a collection takes `empty` and draws it when it has no children. The slot
   sets the size an `EmptyState` inside it takes when it is given none: `sm`, one muted line, inside
   a table, a timeline or a list; `md`, the titled block, on a page, a grid of cards or a chat.
*/

export type EmptySize = "sm" | "md";

const EmptySizeContext = createContext<EmptySize | undefined>(undefined);

/** The size an `EmptyState` takes: its own, else its slot's, else `md`. */
export function useEmptySize(own: EmptySize | undefined): EmptySize {
  const slot = useContext(EmptySizeContext);
  return own ?? slot ?? "md";
}

/** Draws `empty` at the slot's size. Renders no element of its own. */
export function EmptySlot({
  size,
  children,
}: {
  size: EmptySize;
  children?: ReactNode;
}): ReactElement {
  return <EmptySizeContext.Provider value={size}>{children}</EmptySizeContext.Provider>;
}

/** No children: an empty array, `null`, `false` or nothing at all. */
export function hasNoChildren(children: ReactNode): boolean {
  return Children.toArray(children).length === 0;
}
