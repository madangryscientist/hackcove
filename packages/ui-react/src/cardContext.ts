import { createContext, createElement, type ReactElement, type ReactNode, useContext } from "react";

/**
 * Whether a part sits inside a `Card`: an `EmptyState` draws its own dashed frame only when it
 * stands alone. Internal: not exported from the package.
 */
const CardContext = createContext(false);

/** Marks `children` as inside a card. */
export function InCard({ children }: { children: ReactNode }): ReactElement {
  return createElement(CardContext.Provider, { value: true }, children);
}

/** `true` inside a `Card`. */
export function useInCard(): boolean {
  return useContext(CardContext);
}
