import { createContext, createElement, type ReactElement, type ReactNode, useContext } from "react";
import type { StackGap } from "./Stack.js";

/**
 * The gap a `Stack` or `Section` takes when it sets none, from the container it sits in: a `Card`,
 * `Dialog`, `Drawer`, `BottomSheet`, `Callout` or `ListRow` sets `xs`, and at page level there is
 * none, so it is `md`. Internal: not exported from the package.
 */
const GapContext = createContext<StackGap | undefined>(undefined);

/** Sets the gap of a `Stack` inside it that names none. */
export function GapProvider({
  gap,
  children,
}: {
  gap: StackGap;
  children: ReactNode;
}): ReactElement {
  return createElement(GapContext.Provider, { value: gap }, children);
}

/** A `Stack`'s gap: its own, else its container's, else `md`. */
export function useStackGap(gap: StackGap | undefined): StackGap {
  const container = useContext(GapContext);
  return gap ?? container ?? "md";
}
