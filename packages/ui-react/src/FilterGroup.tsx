import type { ComponentPropsWithoutRef, ReactElement, ReactNode } from "react";
import type { Unstyled } from "./props.js";
import { Overline } from "./typography.js";

/** A labelled filter section: a `label` in small uppercase over a wrapped row of chips (e.g. `Button variant="outline" pressed`). Other props go on the fieldset. */
export function FilterGroup({
  label,
  children,
  ...rest
}: {
  /** The section's name, drawn as a small uppercase legend over the chips. */
  label: ReactNode;
} & Unstyled<ComponentPropsWithoutRef<"fieldset">>): ReactElement {
  return (
    <fieldset {...rest} className="min-w-0">
      <Overline as="legend">{label}</Overline>
      <div className="mt-2 flex flex-wrap gap-1.5">{children}</div>
    </fieldset>
  );
}
