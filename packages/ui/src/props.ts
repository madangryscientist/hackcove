/**
 * Drops the two props that would let a consumer restyle a component. Components take no
 * `className` or `style`: a look is a prop or a variant, never a class. Wrap any HTML or ARIA prop
 * type a component spreads in this one.
 */
export type Unstyled<T> = Omit<T, "className" | "style">;
