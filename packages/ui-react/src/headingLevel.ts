import { createContext, createElement, type ReactElement, type ReactNode, useContext } from "react";

/** A heading level below the page's own `h1`. */
export type HeadingLevel = 2 | 3 | 4 | 5 | 6;

/**
 * The level of the nearest heading that holds what is inside: a `Section` or a titled `Card` sets
 * its own, so a `Card` in a `Section` is a 3 and an `EmptyState` in that card a 4. With none it is
 * the page's `h1`. Internal: not exported from the package.
 */
const LevelContext = createContext<1 | HeadingLevel>(1);

/** The level one below each, stopping at 6. */
const NEXT: Record<1 | HeadingLevel, HeadingLevel> = { 1: 2, 2: 3, 3: 4, 4: 5, 5: 6, 6: 6 };

/** Sets the level of the heading that holds `children`. */
export function HeadingLevelProvider({
  level,
  children,
}: {
  level: HeadingLevel;
  children: ReactNode;
}): ReactElement {
  return createElement(LevelContext.Provider, { value: level }, children);
}

/** A heading's level: its own, else one below the heading that holds it, never past 6. */
export function useHeadingLevel(level: HeadingLevel | undefined): HeadingLevel {
  const outer = useContext(LevelContext);
  return level ?? NEXT[outer];
}
