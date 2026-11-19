import {
  createContext,
  createElement,
  type ReactElement,
  type ReactNode,
  useContext,
  useMemo,
} from "react";
import { isResponsive, type ResponsiveSize, type Size } from "./size.js";

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
 * Sets the density for its children: what it leaves out, it keeps from the nearest one above, and
 * `size={null}` clears the size, for a container of the default size or a modal that opens inside a
 * compact one. Internal: not exported from the package.
 */
export function DensityProvider({
  size,
  type,
  children,
}: {
  size?: Size | null | undefined;
  type?: TypeStep | undefined;
  children: ReactNode;
}): ReactElement {
  const outer = useContext(DensityContext);
  const value = useMemo(
    () => ({ size: size === null ? undefined : (size ?? outer.size), type: type ?? outer.type }),
    [size, type, outer],
  );
  return createElement(DensityContext.Provider, { value }, children);
}

/** A control's size: its own `size`, else the nearest container's, else `md`. */
export function useDensity(size: Size | undefined): Size {
  const container = useContext(DensityContext).size;
  return size ?? container ?? "md";
}

/**
 * A control's size where it may also be responsive: its own `size` as given, else the nearest
 * container's, else `md`.
 */
export function useResponsiveDensity(
  size: Size | ResponsiveSize | undefined,
): Size | ResponsiveSize {
  const container = useContext(DensityContext).size;
  return size ?? container ?? "md";
}

/** The type step in force: `compact` under an app that set it, else undefined (the default). */
export function useTypeStep(): TypeStep | undefined {
  return useContext(DensityContext).type;
}

/** A control's type size at each step: `md` is 16px at the default step, and `compact` is one step down. */
const CONTROL_TEXT: Record<"default" | TypeStep, Record<Size, string>> = {
  default: { sm: "text-sm", md: "text-base", lg: "text-lg" },
  compact: { sm: "text-xs", md: "text-sm", lg: "text-base" },
};

/** `CONTROL_TEXT` from the `md` breakpoint up, for a responsive size. */
const CONTROL_TEXT_MD: Record<"default" | TypeStep, Record<Size, string>> = {
  default: { sm: "md:text-sm", md: "md:text-base", lg: "md:text-lg" },
  compact: { sm: "md:text-xs", md: "md:text-sm", lg: "md:text-base" },
};

/**
 * Where a text-entry control would be under 16px, it is 16px on a touch screen, so iOS Safari does
 * not zoom the page when it takes the focus.
 */
const TOUCH_TEXT = "pointer-coarse:text-base";

/**
 * A control's line height by `size`, whatever its type step: 16, 20 and 24px, so with its padding
 * every control is 26, 38 and 46px tall at both steps, and a `Select`, an `IconButton` and a
 * `DateRangePicker`, whose heights are fixed, line up with it.
 */
const CONTROL_LEADING: Record<Size, string> = { sm: "leading-4", md: "leading-5", lg: "leading-6" };

/** `CONTROL_LEADING` from the `md` breakpoint up, for a responsive size. */
const CONTROL_LEADING_MD: Record<Size, string> = {
  sm: "md:leading-4",
  md: "md:leading-5",
  lg: "md:leading-6",
};

/** The size twins, for the data test that each is its table with `md:` on every class. */
export const controlTextTables = {
  text: CONTROL_TEXT,
  textMd: CONTROL_TEXT_MD,
  leading: CONTROL_LEADING,
  leadingMd: CONTROL_LEADING_MD,
};

/**
 * The type class of a control of `size` at `step`; `entry` adds the 16px floor on touch for a field
 * a person types in. A responsive size adds its `md` size from the breakpoint up.
 */
export function controlText(
  size: Size | ResponsiveSize,
  step: TypeStep | undefined,
  entry: boolean,
): string {
  // The touch floor is judged on `base` only: no text-entry control takes a responsive size yet.
  const base = isResponsive(size) ? size.base : size;
  const plain = `${CONTROL_TEXT[step ?? "default"][base]} ${CONTROL_LEADING[base]}`;
  const text = entry && !/text-(base|lg)/.test(plain) ? `${plain} ${TOUCH_TEXT}` : plain;
  if (!isResponsive(size)) return text;
  return `${text} ${CONTROL_TEXT_MD[step ?? "default"][size.md]} ${CONTROL_LEADING_MD[size.md]}`;
}
