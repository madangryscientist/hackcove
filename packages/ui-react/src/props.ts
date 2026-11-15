import type { AriaAttributes } from "react";
import type { DataAttributes } from "./link.js";

/**
 * Drops the two props that would let a consumer restyle a component. Components take no
 * `className` or `style`: a look is a prop or a variant, never a class. Wrap any HTML or ARIA prop
 * type a component spreads in this one.
 */
export type Unstyled<T> = Omit<T, "className" | "style">;

/**
 * What every component takes through to its root: an `id` (an anchor, a `for` or an
 * `aria-describedby` target), `data-*` (an e2e hook, `data-testid`) and `aria-*`. Nothing else, so
 * no handler or `role` the component would have to merge with its own. Only a native control
 * (`Input`, `Select`, `Textarea`, `Button`) spreads its element's own props.
 */
export type Passthrough = AriaAttributes &
  DataAttributes & {
    /** The root element's `id`: an anchor, or the target of a `for` or an `aria-describedby`. */
    id?: string | undefined;
  };
