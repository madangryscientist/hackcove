import type { ComponentPropsWithoutRef, ReactElement, ReactNode } from "react";
import type { Unstyled } from "./props.js";

/** A labelled filter section: a small uppercase legend over a wrapped row of chips (e.g. ToggleChip). Other props go on the fieldset. */
export function FilterGroup({
  legend,
  children,
  ...rest
}: { legend: ReactNode } & Unstyled<ComponentPropsWithoutRef<"fieldset">>): ReactElement {
  return (
    <fieldset {...rest} className="min-w-0">
      <legend className="mb-2 text-xs font-medium tracking-wide text-slate-500 uppercase">
        {legend}
      </legend>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </fieldset>
  );
}
