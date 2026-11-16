import { createContext, createElement, type ReactElement, type ReactNode, useContext } from "react";

/**
 * Whether a part sits inside a `Card`: an `EmptyState` draws its own dashed frame only when it
 * stands alone. Internal: not exported from the package.
 */
const CardContext = createContext(false);

/** Marks `children` as inside a card, or, with `value={false}`, as out of one: a modal opened from a card. */
export function InCard({
  value = true,
  children,
}: {
  value?: boolean;
  children: ReactNode;
}): ReactElement {
  return createElement(CardContext.Provider, { value }, children);
}

/** `true` inside a `Card`. */
export function useInCard(): boolean {
  return useContext(CardContext);
}
