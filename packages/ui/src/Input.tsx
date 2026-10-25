import type { ComponentPropsWithoutRef, ReactElement, ReactNode } from "react";
import { CONTROL_PAD, controlClass, type ControlProps } from "./control.js";
import { cx } from "./cx.js";
import { InputShell, PrefixShell } from "./InputShell.js";
import { SearchInput } from "./SearchInput.js";

/**
 * A text input. `icon` puts a leading icon inside the field (e.g. a search glass). `prefix` puts
 * short text inside the border before the value, such as a currency symbol; it is for a plain
 * field, not with an `icon` or `type="search"`. `type="search"` drops the browser's own search look and shows a "Clear search" button at the trailing edge while the field has a value. */
export function Input({
  icon,
  prefix,
  size = "md",
  width = "full",
  className,
  ...rest
}: ({ icon?: ReactNode; prefix?: undefined } | { icon?: undefined; prefix: string }) &
  ControlProps &
  Omit<ComponentPropsWithoutRef<"input">, "size" | "width" | "prefix">): ReactElement {
  if (rest.type === "search") {
    return <SearchInput {...rest} icon={icon} size={size} width={width} className={className} />;
  }
  if (prefix !== undefined) {
    return (
      <PrefixShell prefix={prefix} size={size} width={width} disabled={rest.disabled}>
        <input
          {...rest}
          className={cx(
            "min-w-0 flex-1 bg-transparent px-1 outline-none placeholder:text-slate-400",
            className,
          )}
        />
      </PrefixShell>
    );
  }
  if (icon === undefined) {
    return (
      <input {...rest} className={cx(controlClass(size, width), CONTROL_PAD[size].x, className)} />
    );
  }
  return (
    <InputShell icon={icon} size={size} width={width}>
      <input
        {...rest}
        className={cx(
          controlClass(size, width === "auto" ? "auto" : "full"),
          CONTROL_PAD[size].icon,
          className,
        )}
      />
    </InputShell>
  );
}
