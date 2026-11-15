import type { ReactElement, ReactNode } from "react";
import type { Passthrough } from "./props.js";

/** Inline code: mono, on a subtle inset background. It takes the surrounding text colour and size (a touch smaller, for the mono face). */
export function Code({ children, ...rest }: { children: ReactNode } & Passthrough): ReactElement {
  return (
    <code {...rest} className="rounded bg-slate-100 px-1 py-0.5 font-mono text-[0.9em]">
      {children}
    </code>
  );
}
