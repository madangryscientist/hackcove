import { createContext, useContext } from "react";
import type { Size } from "./size.js";

/**
 * The density a container sets for the controls inside it: a `Card`, `ListRow` or `Table` of a
 * size provides it, and a `Button`, `IconButton` or `Pill` with no `size` of its own takes it, so a
 * compact card's buttons are compact without a prop on each. Internal: not exported from the
 * package.
 */
export const DensityContext = createContext<Size | undefined>(undefined);

/** A control's size: its own `size`, else the nearest container's density, else `md`. */
export function useDensity(size: Size | undefined): Size {
  const container = useContext(DensityContext);
  return size ?? container ?? "md";
}
