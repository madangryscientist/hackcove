import type { AriaAttributes } from "react";
import type { DataAttributes } from "./link.js";

/**
 * Drops the two props that would let a consumer restyle a component. Components take no
 * `className` or `style`: a look is a prop or a variant, never a class. Wrap any HTML or ARIA prop
 * type a component spreads in this one.
 */
export type Unstyled<T> = Omit<T, "className" | "style">;

/**
 * What a component with no single natural element takes through to its root: `data-*` (an e2e
 * hook, `data-testid`) and `aria-*`. Nothing else, so no handler, `id` or `role` the component
 * would have to merge with its own.
 */
export type Passthrough = AriaAttributes & DataAttributes;
