import type { ComponentPropsWithoutRef, ReactElement, ReactNode } from "react";
import { controlClass } from "./control.js";
import { cx } from "./cx.js";

/** A text input. `icon` puts a leading icon inside the field (e.g. a search glass). */
export function Input({
  icon,
  className,
  ...rest
}: { icon?: ReactNode } & ComponentPropsWithoutRef<"input">): ReactElement {
  if (icon === undefined) {
    return <input {...rest} className={cx(controlClass, "px-3", className)} />;
  }
  return (
    <div className="relative">
      <span
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-slate-400 [&>svg]:h-4 [&>svg]:w-4"
      >
        {icon}
      </span>
      <input {...rest} className={cx(controlClass, "pr-3 pl-9", className)} />
    </div>
  );
}
