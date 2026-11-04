import type { HTMLAttributes, ReactElement, ReactNode } from "react";
import type { Unstyled } from "./props.js";

/** A keyboard key. Its border takes the surrounding text colour, so it reads on a filled button and on plain text. */
export function Kbd({
  children,
  ...rest
}: {
  children: ReactNode;
} & Unstyled<HTMLAttributes<HTMLElement>>): ReactElement {
  return (
    <kbd {...rest} className="rounded border border-current/30 px-1 font-mono text-xs leading-4">
      {children}
    </kbd>
  );
}
