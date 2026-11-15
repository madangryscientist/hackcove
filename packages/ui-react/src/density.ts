import {
  createContext,
  createElement,
  type ReactElement,
  type ReactNode,
  useContext,
  useMemo,
} from "react";
import type { Size } from "./size.js";

/**
 * The type step a whole app may set once: `compact` is one step down for text, headings and
 * controls, for an app's chrome; unset is the default, a site's. Only `AppShell` sets it.
 */
export type TypeStep = "compact";

/**
 * What a container sets for the parts inside it. `size` is the control size: a `Card`, `ListRow`
 * or `Table` of a size provides it, and a `Button`, `IconButton` or `Pill` with no `size` of its
 * own takes it, so a compact card's buttons are compact without a prop on each. `type` is the type
 * step, set once around the app. The two are independent: a container that sets a size keeps the
 * type step from above.
 */
type Density = { size: Size | undefined; type: TypeStep | undefined };

const DensityContext = createContext<Density>({ size: undefined, type: undefined });

/**
 * Sets the density for its children: what it leaves out, it keeps from the nearest one above.
 * Internal: not exported from the package.
 */
export function DensityProvider({
  size,
  type,
  children,
}: {
  size?: Size | undefined;
  type?: TypeStep | undefined;
  children: ReactNode;
}): ReactElement {
  const outer = useContext(DensityContext);
  const value = useMemo(
    () => ({ size: size ?? outer.size, type: type ?? outer.type }),
    [size, type, outer],
  );
  return createElement(DensityContext.Provider, { value }, children);
}

/** A control's size: its own `size`, else the nearest container's, else `md`. */
export function useDensity(size: Size | undefined): Size {
  const container = useContext(DensityContext).size;
  return size ?? container ?? "md";
}

/** The type step in force: `compact` under an app that set it, else undefined (the default). */
export function useTypeStep(): TypeStep | undefined {
  return useContext(DensityContext).type;
}
