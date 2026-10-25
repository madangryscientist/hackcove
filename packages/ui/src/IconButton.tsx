import type { ComponentPropsWithoutRef, ReactElement, ReactNode } from "react";
import { focusRing } from "./cx.js";
import type { Unstyled } from "./props.js";

const BASE = `inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50 disabled:pointer-events-none disabled:opacity-50 ${focusRing}`;

/** A square bordered button holding one icon. `label` is its accessible name and tooltip. Defaults to `type="button"`. */
export function IconButton({
  label,
  children,
  ...rest
}: { label: string; children: ReactNode } & Unstyled<
  Omit<ComponentPropsWithoutRef<"button">, "children">
>): ReactElement {
  return (
    <button type="button" {...rest} aria-label={label} title={label} className={BASE}>
      {children}
    </button>
  );
}
